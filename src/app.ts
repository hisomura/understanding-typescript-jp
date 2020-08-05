import axios from 'axios'

const form = document.querySelector('form')!
const addressInput = document.getElementById('address')! as HTMLInputElement

const GOOGLE_API_KEY = 'AIzaSyDVrRgTnS_R_kbj9ry5_1mv9PlxqgJ8NQY'

type GoogleGeocodingResponse = {
  results: { geometry: { location: { lat: number; lng: number } } }[]
  status: 'OK' | 'ZERO_RESULTS'
}

function searchAddressHandler(event: Event) {
  event.preventDefault()
  const enteredAddress = addressInput.value

  const parameters = `address=${encodeURI(enteredAddress)}&key=${GOOGLE_API_KEY}`
  axios
    .get<GoogleGeocodingResponse>('https://maps.googleapis.com/maps/api/geocode/json?' + parameters)
    .then((response) => {
      if (response.data.status !== 'OK') {
        throw new Error('座標を取得できませんでした')
      }
      const coordinates = response.data.results[0].geometry.location
      const map = new google.maps.Map(document.getElementById('map') as HTMLElement, {
        center: coordinates,
        zoom: 16,
      })
      new google.maps.Marker({position: coordinates, map: map});

      console.log(response)
    })
    .catch((err) => {
      alert(err.message)
      alert(err)
    })
}

form.addEventListener('submit', searchAddressHandler)
