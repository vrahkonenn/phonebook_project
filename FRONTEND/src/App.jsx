import { useState, useEffect } from 'react'
import personsService from './services/persons'
import './App.css'

const RenderSearch = ({search, searchChange}) => {
  return (
    <div>
      <input value={search} onChange={searchChange} className='searchBar' placeholder='Search for a contact...'/>
    </div>
  )
}

const RenderAddNew = ({onSubmit, newName, nameChange, newNumber, numberChange, handleImageChange}) => {
  return (
    <div>
      <fieldset className='fieldset'>
        <legend><i>ADD NEW CONTACT</i></legend>
        <form onSubmit={onSubmit}>
          <label>
            <img 
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
            className="newpicture"
            id="preview" />
            <input type="file" id="fileInput" accept="image/*" className="fileInput" onChange={(event) => handleImageChange(event, 'preview')}/>
          </label>
          
          <div className='input'><label htmlFor="name">Name: </label><input value={newName} onChange={nameChange} type='text' id='name'/></div>
          <div className='input'><label htmlFor="number">Number: </label><input value={newNumber} onChange={numberChange} type='text' id='number'/></div>
          <button type="submit" className='submitButton'><i>SUBMIT</i></button>
        </form>
        </fieldset>
    </div>
  )
}

const RenderPersons = ({persons, search, deleteOnClick}) => {
  const filteredArray = persons
    .filter(person => person.name.toLowerCase().includes(search.toLowerCase()))
    .map(person => (
      <div key={person.id}>
        <hr />
        <table className='table'>
          <tbody>
            <tr className='individual'>
              <td><img src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" className="picture" /></td>
              <td>{person.name}</td>
              <td>{person.number}</td>
              <td><button onClick={() => deleteOnClick(person.name, person.id)} className='deleteButton'>Delete</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    ))

  console.log('filtered', filteredArray)

  return (
  <div>
    {filteredArray}
  </div>
  )
}

const Notice = ({notice}) => {
  const noticeStyle = {
    color: 'green',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '5px',
    marginBottom: '10px',
    marginTop: '10px'
  }

  if (notice === null) {
    return null
  }

  return (
      <div style={noticeStyle}>
        <p>
          {notice}
        </p>
      </div>
  )
}

const Warn = ({warn}) => {
  const warnStyle = {
    color: 'red',
    background: 'lightgrey',
    fontSize: '20px',
    borderStyle: 'solid',
    borderRadius: '5px',
    padding: '5px',
    marginBottom: '10px',
    marginTop: '10px'
  }

  if (warn === null) {
    return null
  }

  return (
    <div style={warnStyle}>
      <p>
        {warn}
      </p>
    </div>
  )

}

const App = () => {
  const [persons, setPersons] = useState([]) 
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState(null)
  const [warn, setWarn] = useState(null)
  const [imageFile, setImageFile] = useState(null);


  useEffect(() => {
      personsService.getPersons()
        .then(persons => {
          setPersons(persons)
      })
  }, [])

  const deleteOnClick = (name, id) => {

    if (window.confirm(`Delete ${name} from phonebook?`)) {
      personsService
        .deletePerson(id)
        .then(() => {
          setPersons(persons.filter(p => p.id !== id))
          console.log(`${name} removed succesfully.`)
          setNotice(`${name} removed succesfully.`)
          setTimeout(() => {
            setNotice(null)
          }, 3000)
        })
        .catch(error => {
          setWarn(`${newName} has already been removed from server.`)
          setTimeout(() => {
          setWarn(null)
          }, 3000)
          setPersons(persons.filter(p => p.id !== id))
      })
    } else {
      console.log(`remove of ${name} cancelled.`)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    const names = persons.map(person => (
      person.name
    ))

    let imageUrl = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"; // oletuskuva

    if (imageFile) {
      try {
        imageUrl = await uploadImageToCloudinary(imageFile);
        console.log('Kuvan URL:', imageUrl);
      } 
      catch (err) {
        console.error(err);
        setWarn('Kuvan lähetys epäonnistui.');
        setTimeout(() => setWarn(null), 5000);
        return;
      }
    }

    const personObject = {name: newName, number: newNumber, image: imageUrl}

    if (names.includes(newName)) {
        if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
          const personToUpdate = persons.find(person => person.name === newName)
          console.log('person to update:', personToUpdate)
          personsService
            .updateNumber(personToUpdate.id, personObject)
            .then(response => {
              setPersons(persons.map(person => person.id !== personToUpdate.id ? person : response))
                setNotice(`Number of ${newName} updated.`)
                setTimeout(() => {
                  setNotice(null)
                }, 3000)
            })
            .catch(error => {
              setWarn(`${newName} has already been removed from server.`)
              setTimeout(() => {
                setWarn(null)
              }, 3000)
              setPersons(persons.filter(p => p.id !== personToUpdate.id))
            })
        }
        
        setNewName('')
        setNewNumber('')
        

    } else {
      personObject.image = imageUrl
        personsService.addPerson(personObject)
          .then(returnedPersons => {
            setPersons(persons.concat(returnedPersons))
            setNotice(`${newName} added to the phonebook.`)
            console.log('henkilö: ', personObject)
            setTimeout(() => {
              setNotice(null)
            }, 3000)
          })
          .catch(error => {
            console.log('virhe', error)
            setWarn(error.response.data.error)
            setTimeout(() => {
                setWarn(null)
              }, 5000)
          })

        setNewName('')
        setNewNumber('')
    }
  }

  const nameChange = (event) => {
    setNewName(event.target.value)
  }

  const numberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const searchChange = (event) => {
    setSearch(event.target.value)
  }

  const handleImageChange = async (event, imgId) => {
    const file = event.target.files[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.getElementById(imgId);
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  const uploadImageToCloudinary = async (file) => {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error('Kuvan lähetys epäonnistui.');
  }
};


  return (
    <div className='mainDiv'>
      <h1><i>PHONEBOOK</i></h1>
      <div className='tables'>
        <RenderSearch search ={search} searchChange={searchChange}/>
        <RenderAddNew onSubmit={onSubmit} newName={newName} nameChange={nameChange} newNumber={newNumber} numberChange={numberChange} handleImageChange={handleImageChange}/>
        <Notice notice= {notice}/>
        <Warn warn={warn}/>
        <RenderPersons persons={persons} search={search} deleteOnClick={deleteOnClick}/>
      </div>
    </div>
  )
}

export default App