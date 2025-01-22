const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')

const app = express()

const ACCEPTED_TOKEN = 'Nu.DopustimEto.JWTToken'
const USER_DATA = {
    username: 'alaska',
    email: 'alaska@example.com',
    token: ACCEPTED_TOKEN
}
const USER_DATA_2 = {
    username: 'crimea',
    email: 'crimea@example.com',
    token: ACCEPTED_TOKEN
}

const EVENTS_ATTENDING = {

}

const EVENT = {
    id: 1,
    name: 'Lorem ipsum dolor sit amet',
    address: 'Moscow, Skatertny Lane, 3',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam et volutpat velit. Vivamus et nulla neque. Integer feugiat aliquam nunc, ut feugiat magna ullamcorper sed. Maecenas lacinia sem diam, ultrices sodales lorem gravida tempus. In ullamcorper blandit metus, a dictum nisl congue viverra. Vestibulum vel suscipit sem. Donec ut porta metus.`,
    geolocation: [55.755246, 37.597666],
    attending: false,
    date: 1740082428,
    image: 'https://www.eventstop.co.uk/assets/eventstop-slide2-c10c457488a7c2e098eb4886eced4e55262f8a96cc9698b4918cc39567214ac2.jpg',
    blurhash: 'L7BKhu1E1D}Y1o,_=OJ817-Bs%AB',
}

// parse application/json
app.use(bodyParser.json())

app.use((req,res,next) => {
    console.log(req.method, req.url)
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Headers', '*')
    return next()
})



app.post('/api/v1/profile/signin/', (req,res) => {
    if (req.body.username === 'alaska' && req.body.password === 'alaska') {
        return res.json({
            status: 'ok',
            data: USER_DATA
        })
    }
    return res.status(401).json({status: 'error', error: 'Wrong username and/or password'})
})

app.post('/api/v1/profile/reset-password/', (req,res) => {
    return res.json({
        status: 'ok'
    })
})

app.post('/api/v1/profile/signup/', (req,res) => {
    return res.json({
        status: 'ok',
    })
})

app.get('/api/v1/profile/', (req,res) => {
    if (req.headers.authorization !== `Bearer ${ACCEPTED_TOKEN}`) {
        return res.status(401).json({status: 'error', error: 'unauthorized'})
    }
    return res.json({
        status: 'ok',
        data: USER_DATA_2
    })
})

app.post('/api/v1/profile/', (req,res) => {
    if (req.headers.authorization !== `Bearer ${ACCEPTED_TOKEN}`) {
        return res.status(401).json({status: 'error', error: 'unauthorized'})
    }
    return res.json({
        status: 'ok'
    })
    //return res.status(401).json({
    //    status: 'error',
    //    error: 'Bad password'
    //})
})

app.get('/api/v1/events/', (req,res) => {
    if (req.headers.authorization !== `Bearer ${ACCEPTED_TOKEN}`) {
        return res.status(401).json({status: 'error', error: 'unauthorized'})
    }
    const page = parseInt(req.query.page || '1')
    const items = [];
    for (let n=0; n<10; n++) {
        const id = (page-1)*10 + n + 1
        items.push({
            ...EVENT,
            name: EVENT.name + ' ' + id,
            id,
            image: EVENT.image + '?q=' + id,
            attending: EVENTS_ATTENDING[id] || false,
        })
    }
    if (req.query.search && req.query.search.toLowerCase() === 'alaska') {
        console.log('here')
        items.forEach((item, index) => item.name = 'alaska' + ((page-1)* 10 + index + 1))
    }
    return res.json({
        status: 'ok',
        data: {
            page,
            total: 10,
            totalPages: 5,
            items
        },
    })
})

app.get('/api/v1/events/:id/attendance-code', (req,res) => {
    if (req.headers.authorization !== `Bearer ${ACCEPTED_TOKEN}`) {
        return res.status(401).json({status: 'error', error: 'unauthorized'})
    }
    const id = parseInt(req.params.id)
    console.log(id)
    return res.json({
        status: 'ok',
        data: {
            id,
            code: crypto.randomBytes(10).toString('hex')
        },
    })
})

app.post('/api/v1/events/:id/change-attendance', (req,res) => {
    if (req.headers.authorization !== `Bearer ${ACCEPTED_TOKEN}`) {
        return res.status(401).json({status: 'error', error: 'unauthorized'})
    }
    const id = parseInt(req.params.id)
    EVENTS_ATTENDING[id] = req.body.attending
    return res.json({
        status: 'ok'
    })
})


app.listen(3000)