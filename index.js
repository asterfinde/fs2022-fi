//~
import express from 'express'

import morgan from 'morgan'

import cors from 'cors'

import Person from './models/person.js'

const HOST_NAME = process.env.HOST_NAME || 'localhost'
const PORT = process.env.PORT || 3001

const requestLogger = ( request, response, next ) => {
	console.log('Method:  ', request.method)
	console.log('Path:    ', request.path)
	console.log('Body:    ', request.body)
	console.log('FullUrl: ', request.protocol + '://' + request.get('host') + request.originalUrl)
	console.log('---------')
	
	next()
}

const app = express()

// correct order
app.use( express.static('build') )
app.use( express.json() )
app.use( requestLogger )
app.use( cors() )

morgan.token('body', req => {
	return JSON.stringify( req.body )
})
app.use( morgan(':method :url - :response-time ms :body') )

// info
app.get('/api/persons/info', async ( request, response ) => {
	const entries = await Person.countDocuments( {} ).exec()
	const requestTime = new Date() 
	
	response.send(`Phonebook has info for ${entries} people<br/> ${requestTime}`)
})

// create
app.post('/api/persons', async ( request, response, next ) => {
	const body = request.body

	if ( !body.name ) {
        return response
                 .status( 400 )
                 .send( { error: 'Name missing' } )        
	}
	
	if ( !body.number ) {
        return response
                 .status( 400 )
                 .send( { error: 'Number missing' } )
	}

    try {
        const person = new Person({
            name: body.name,
            number: body.number,
        })
        
        await person.save()
            .then( savedPerson => {
                response.json( savedPerson.toJSON() )
        })
    }

    catch ( error ) {
        next( error )    
    }
})

// read
app.get('/api/persons', async ( request, response, next ) => {
    try {
        await Person.find( {} )
        .then( persons => {	
            response.json( persons )
        })
    }

    catch ( error ) {
        next( error )    
    }
})

app.get('/api/persons/:id', async ( request, response, next ) => {
    try {
        await Person.findById( request.params.id )
        .then( person => {
            if ( person ) {
                response.json( person )

            } else {
                response.status(404).send(`Current person: ${request.params.id} doesn't match`).end() 
            }
        })
    }

    catch ( error ) {
        next( error )    
    }
})

// update
app.put('/api/persons/:id', async ( request, response, next ) => {
    try {
        const idPerson = await Person.findById( request.params.id )

        if ( idPerson !== null ) {
            const { name, number } = request.body

            await Person.findByIdAndUpdate(
                request.params.id, 
                { name, number },
                { new: true, runValidators: true, context: 'query' }
            )

            .then( updatedPerson => {
                response.json( updatedPerson )
            })
        } else {
            throw Error()
        }   
    }

    catch ( error ) {
        next( error )    
    }
})

// delete
app.delete('/api/persons/:id', async ( request, response, next ) => {
    try {
        await Person.findByIdAndRemove( request.params.id )
        .then( () => {
            response.status( 204 ).end()
        })
    }
    
    catch ( error ) {
        next( error )    
    }
})

const unknownEndpoint = ( request, response ) => {
	response.status( 404 ).send({ error: 'unknown endpoint' })
}
app.use( unknownEndpoint )

const handleDuplicateKeyError = ( error, response ) => {
    const field = Object.keys( error.keyValue )
    const dataError = error.keyValue[ field ]

    response
        .status( 409 )
        .send( {messages: `A Person with name '${dataError}' already exists.`} )
 }

const handleValidationError = ( error, response ) => {
    const key = Object.keys( error.errors )

    const field = '"' + error.errors[ key[0] ].path + '"'
    const value = error.errors[ key[0] ].value
    const embeddedText = `${field} ('${value}')`
    
    let message = error.errors[ key[0] ].properties.message
    
    message = message.replace(field, embeddedText)

    response.status( 400 )
            .send( {messages: message})
}

const errorHandler = ( error, request, response, next ) => {
    if ( error.name === 'CastError' && error.kind == 'ObjectId' ) {
        return response.status(400).send({ error: 'malformatted id' })

    }  else if ( error.name === 'ValidationError' ) {
        return handleValidationError( error, response )
    
    }  else if ( error.code && error.code == 11000 ) {
        return handleDuplicateKeyError( error, response )

    }  else if ( error.name === 'Error' ) {
        return response.status(400).send({ error: 'Person not found!' })
    }

    next( error )
}
app.use( errorHandler )

//
app.listen( PORT, HOST_NAME, () => {
	console.log(`Server running at http://${HOST_NAME}:${PORT}/` );
})
