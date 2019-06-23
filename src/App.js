import React, { Component } from 'react';
import Particles from 'react-particles-js';
// import Clarifai from 'clarifai';
import Navigation from './components/navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';

// lesson
// move the Clarifai api key to the back-end.

// const app = new Clarifai.App({
//   apiKey: '69f8e27a05a34a9a9083666516999b89'
// });

const particlesOptions = {
  "particles": {
    "number": {
        "value": 160
    },
    "size": {
        "value": 1
    }
  },
  "interactivity": {
    "events": {
        "onhover": {
            "enable": true,
            "mode": "repulse"
        }
    }
  }
}

const initialState = {
  input:'',
  imageURL:'',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user: {
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: ''
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
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

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onPictureSubmit = () => {
    this.setState({imageURL: this.state.input});
      fetch('https://reizinho-face-detect-server.herokuapp.com/imageurl', {
        method: 'post',
        headers: {'content-Type': 'application/json'},
        body: JSON.stringify({
          input: this.state.input
        })
      })
      .then(response => response.json())
    /* app.models
        .predict(Clarifai.FACE_DETECT_MODEL, this.state.input)
          moved to back-end */
      .then(response => {
        if (response) {
          fetch('https://reizinho-face-detect-server.herokuapp.com/image', {
            method: 'put',
            headers: {'content-Type': 'application/json'},
            body: JSON.stringify({
               id:this.state.user.id
            })
          })
          .then(response => response.json())
          .then(count => {
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)
        }
      this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout') {
      this.setState(initialState)
    } else if (route === 'home') {
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render() {
    const { isSignedIn, imageURL, route, box } = this.state;
    return (
      <div className="App">
        <Particles 
          className='particles' 
          params={particlesOptions} />
        <Navigation 
          isSignedIn={isSignedIn} 
          onRouteChange={this.onRouteChange} />
        { route === 'home'
          ? <div>
              <Logo />
              <Rank 
                name={this.state.user.name} 
                entries={this.state.user.entries} />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onPictureSubmit} />
              <FaceRecognition 
                box={box} 
                imageURL={imageURL} /> 
            </div>
          : (
            route === 'signin'
            ? <SignIn 
                loadUser={this.loadUser} 
                onRouteChange={this.onRouteChange} />
            : <Register
                loadUser={this.loadUser} 
                onRouteChange={this.onRouteChange} />
            )
        }
      </div>
    );
  }
}


export default App;