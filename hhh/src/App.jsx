import { useState, useEffect } from 'react'
import personsService from './services/persons'

const RenderSearch = ({search, searchChange}) => {
  return (
    <div>
      filter shown with <input value={search} onChange={searchChange} />
    </div>
  )
}

const RenderAddNew = ({onSubmit, newName, nameChange, newNumber, numberChange}) => {
  return (
    <div>
      <h2>add a new</h2>
      <form onSubmit={onSubmit}>
        <div>name: <input value={newName} onChange={nameChange} /></div>
        <div>number: <input value={newNumber} onChange={numberChange}/></div>
        <div><button type="submit">add</button></div>
      </form>
    </div>
  )
}

const RenderPersons = ({persons, search, deleteOnClick}) => {
  const filteredArray = persons
    .filter(person => person.name.toLowerCase().includes(search.toLowerCase()))
    .map(person => (
      <tr key={person.id}>
        <td>{person.name}</td><td>{person.number}</td><td><button onClick={() => deleteOnClick(person.name, person.id)}>Delete</button></td>
      </tr>
    ))

  console.log('filtered', filteredArray)

  return (
  <div>
    <h2>Numbers</h2>
    <table>
      <thead>
        <tr>
          <th>NAME</th>
          <th>NUMBER</th>
        </tr>
      </thead>
    <tbody>
    {filteredArray}
    </tbody>
    </table>
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

  const onSubmit = (event) => {
    event.preventDefault()
    const names = persons.map(person => (
      person.name
    ))

    const personObject = {name: newName, number: newNumber}
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
        personsService.addPerson(personObject)
          .then(returnedPersons => {
            setPersons(persons.concat(returnedPersons))
            setNotice(`${newName} added to the phonebook.`)
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

  return (
    <div>
      <h1>Phonebook</h1>
      <RenderSearch search ={search} searchChange={searchChange}/>
      <RenderAddNew onSubmit={onSubmit} newName={newName} nameChange={nameChange} newNumber={newNumber} numberChange={numberChange}/>
      <Notice notice= {notice}/>
      <Warn warn={warn}/>
      <RenderPersons persons={persons} search={search} deleteOnClick={deleteOnClick}/>
    </div>
  )
}

export default App