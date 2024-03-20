import React, {useEffect, useRef, useState} from 'react'
import './App.css'

// Just add your API key here and you're good to go
 const apiKey =  import.meta.env.VITE_APP_GMAP_API_KEY
const mapApiJs = 'https://maps.googleapis.com/maps/api/js';
const geocodeJson = 'https://maps.googleapis.com/maps/api/geocode/json';

// load google map api js
function loadAsyncScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    Object.assign(script, {
      type: 'text/javascript',
      async: true,
      src,
    });
    script.addEventListener('load', () => resolve(script));
    document.head.appendChild(script);
  });
}

const extractAddress = (place) => {
  const address = {
    city: '',
    state: '',
    zip: '',
    country: '',
    plain() {
      const city = this.city ? this.city + ', ' : '';
      const zip = this.zip ? this.zip + ', ' : '';
      const state = this.state ? this.state + ', ' : '';
      return city + zip + state + this.country;
    },
  };

  if (!Array.isArray(place?.address_components)) {
    return address;
  }

  place.address_components.forEach((component) => {
    const types = component.types;
    const value = component.long_name;

    if (types.includes('locality')) {
      address.city = value;
    }

    if (types.includes('administrative_area_level_2')) {
      address.state = value;
    }

    if (types.includes('postal_code')) {
      address.zip = value;
    }

    if (types.includes('country')) {
      address.country = value;
    }
  });

  return address;
};

function App() {
  const searchInput = useRef(null);
  const myLocation = useRef(null);

  const [address, setAddress] = useState({});
  const [location, setLocation] = useState('');
 
  // init gmap script
  const initMapScript = () => {
    // if script already loaded
    if (window.google) {
      return Promise.resolve();
    }
    const src = `${mapApiJs}?key=${apiKey}&libraries=places&v=weekly`;
    return loadAsyncScript(src);
  };

  const onChangeAddress = (autocomplete) => {
    const place = autocomplete.getPlace();
    const suggestion = place.formatted_address;
    setLocation(suggestion);
  };

  // init autocomplete
  const initAutocomplete = () => {
    if (!searchInput.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(searchInput.current);
    autocomplete.setFields(['address_component', 'geometry']);
    // Configure Autocomplete to only retrieve formatted address
    autocomplete.setFields(['formatted_address']);
    autocomplete.addListener('place_changed', () => onChangeAddress(autocomplete));
      };

  const reverseGeocode = ({ latitude: lat, longitude: lng }) => {
    const url = `${geocodeJson}?key=${apiKey}&latlng=${lat},${lng}`;
       fetch(url)
      .then((response) => response.json())
      .then((location) => {
        const place = location.results[0];
        const _address = extractAddress(place);
        setAddress(_address);
        const fullAddress = _address.plain();
        setLocation(location.results[0]);
        // searchInput.current.value = fullAddress;
        myLocation.current.value = fullAddress;
      });
  };

  const findMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        reverseGeocode(position.coords);
      });
    }
  };

  // load map script after mounted
  useEffect(() => {
    initMapScript().then(() => initAutocomplete());
  }, []);

  return (
    <div className="App" style={{align:"center" , color:"red"}}>
        <br/>
      <br/> 
      <input  ref={searchInput} type="text" placeholder="Search location...." />
      <br/>
      <br/>
      <button onClick={findMyLocation}  placeholder=" Search location ">Insert my location </button>
      <br/>
      <input  ref={myLocation} type="text" placeholder="my location " />

      {/* <h1> {location || "Location"} </h1> */}
     
    </div>
  );
}

export default App;