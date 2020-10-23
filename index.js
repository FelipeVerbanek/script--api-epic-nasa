require('dotenv').config()
const axios = require('axios')
const fs = require('fs')
const moment = require('moment')

const baseUrl = process.env.BASE_URL
const key = process.env.KEY_API

const searchImagesEarth = async (date) => {
    const startMonth = moment(date).startOf('month').format('YYYY-MM-DD')
    const daysMonth = date.getDate()

    for (let index = 1; index < daysMonth; index++) {
        const dateCurrent = moment(startMonth).add(index, 'days').format('YYYY-MM-DD')
        const data = await getInfoNasa(dateCurrent)

        if (data.length > 0) {
            await Promise.all(
                data.map((data) => {
                    if(data.image && data.centroid_coordinates.lon < 0) {
                        if((data.centroid_coordinates.lon * -1) >= 60 && (data.centroid_coordinates.lon * -1) <= 85 ) { 
                            downlaodImage(moment(dateCurrent).format('YYYYMMDD'),data.image)
                        }
                    }
                })
            )
        }


    }
}

const getInfoNasa = async (date) => {
    try {
        const response = await axios({
            method: 'get',
            url: `${baseUrl}/api/natural/date/${date}?api_key=${key}`
        })

        return response.data
    } catch (error) {
        console.error(error.message);
    }
}

const downlaodImage = async (date, image) => {
    try {        
        const response = await axios({
            method: 'get',
            url: `${baseUrl}/archive/natural/${date.toString().substr(0,4)}/${date.toString().substr(4,2)}/${date.toString().substr(6,2)}/png/${image}.png?api_key=${key}`,
            responseType: 'stream'
        })

        response.data.pipe(fs.createWriteStream(`./file/brasil/${image}.png`))
      } catch (error) {
        console.error(error.message);
      }
}

searchImagesEarth(new Date())