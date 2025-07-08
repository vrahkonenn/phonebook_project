import axios from 'axios'

const baseUrl = '/api/persons'

const getPersons = () => {
    const request = axios.get(baseUrl)
    return(
        request.then(response => response.data)
    )
}

const addPerson = (personObject) => {
    const request = axios.post(baseUrl, personObject)
    return (
        request.then(response => response.data)
    )
}

const deletePerson = (id) => {
    return axios.delete(`${baseUrl}/${id}`)
}

const updateNumber = (index, personObject) => {
    return (
        axios.put(`${baseUrl}/${index}`, personObject)
        .then(response => response.data)
    )
}

export default {getPersons, addPerson, deletePerson, updateNumber}