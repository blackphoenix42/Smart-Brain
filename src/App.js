import './App.css';
import React, { useState } from 'react';
import Navigation from './components/Navigation/Navigation'
import Logo from './components/Logo/Logo'
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm'
import Rank from './components/Rank/Rank'
import FaceRecognition from './components/FaceRecognition/FaceRecognition'
import SignIn from './components/SignIn/SignIn'
import Register from './components/Register/Register'
import Particles from 'react-particles-js';
import Clarifai from 'clarifai'
import API_Key from './config'

function App() {

  const app = new Clarifai.App({
    apiKey: `${API_Key}`
  });

  const particlesOptions = {
    particles: {
      number: {
        value: 100,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
  }
  const [input, setInput] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [box, setBox] = useState({})
  const [route, setRoute] = useState('signin')
  const [isSignedIn, setIsSignedIn] = useState(false)

  const [id, setId] = useState('')
  // const [name, setName] = useState('')
  // const [email, setEmail] = useState('')
  const [entries, setEntries] = useState(0)
  // const [joined, setJoined] = useState('')

  const calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }
  }


  const displayFaceBox = (box) => {
    setBox(box);
  }


  const onInputChange = (e) => {
    setInput(e.target.value)
  }


  const onButtonSubmit = () => {
    setImageUrl(input)
    app.models
      .predict(Clarifai.FACE_DETECT_MODEL, input)
      .then(response => {
        if (response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id
            })
          })
            .then(response => response.json())
            .then(count => {
              setEntries(count)
            })
        }
        displayFaceBox(calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  const onRouteChange = (route) => {
    if (route === 'signout') {
      setIsSignedIn(false)
    }
    else if (route === 'home') {
      setIsSignedIn(true)
    }
    setRoute(route)
  }

  return (
    <div className="App" >

      <Particles
        className='particles'
        params={particlesOptions}
      />
      <Navigation isSignedIn={isSignedIn} onRouteChange={onRouteChange} />
      {
        route === 'home' ?
          <div>
            <Logo />
            <Rank />
            <ImageLinkForm onInputChange={onInputChange} onButtonSubmit={onButtonSubmit} />
            <FaceRecognition imageUrl={imageUrl} box={box} />
          </div> :
          (
            route === 'signin' ?
              < SignIn onRouteChange={onRouteChange} /> :
              < Register onRouteChange={onRouteChange} />
          )
      }
    </div >
  );
}

export default App;
