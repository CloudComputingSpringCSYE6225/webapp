export const setResponse = (obj, status, response)=>{
    response.status(status).send(obj)
    // response.json(obj)
}

// export const setError = (err, status, response) => {
//     response.status(status).send({"message": err})
//     // response.json(err)
// }