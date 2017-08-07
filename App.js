import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, Keyboard } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Spinner, Item, Input, List, ListItem} from 'native-base';
import Display from './components/Display';
import GooglePlacesAutoComplete from 'react-native-google-places-autocomplete';
import { Font } from 'expo';
import axios from 'axios';
import key from './key.json';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      fontLoaded: false, 
      textToShow: 'original',
      places: [],
      locationLat: '',
      locationLong: '',
      placeInput: '',
      foundPlaces: false,
      findingResults: false,
      placeDetails: '',
      autocompleteSuggestions: []

    };
    this.chooseRandomPlace = this.chooseRandomPlace.bind(this)  
  }

  async componentDidMount() {
    await Font.loadAsync({
      'Roboto_medium': require('./node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    this.setState({ fontLoaded: true, key: key.value });
  }

  updateText = () => {
    if(this.state.textToShow == 'original'){
      this.setState({textToShow: 'change'})  
    } else {
      this.setState({textToShow: 'original'})  
    }
    
  }

  getPlacesList = () => {
    if(this.state.placeInput.trim() != ''){
      this.setState({ findingResults : true, foundPlaces: false });
      query = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.state.placeInput + '&key=' + mykey.value;
      axios.get(query)
        .then(response => {
          console.log(response.data.results)
          console.log(query)
          this.setState({ 
            locationLat: response.data.results[0].geometry.location.lat, 
            locationLong: response.data.results[0].geometry.location.lng  })

          query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.state.locationLat + ',' + this.state.locationLong + '&radius=500&type=restaurant&key=' + mykey.value
          axios.get(query)
            .then(response => {
              this.setState({
                foundPlaces: true,
                findingResults: false,
                places: response.data.results
              })
            });
        });
    }
  }

  renderPlaces () {
    return this.state.places.map(place => <Text>{place.name}</Text>)
  }

  chooseRandomPlace () {
    this.getPlacesList();
  }

  getAutoCompleteSuggestions (text) {
      query = 'https://maps.googleapis.com/maps/api/place/autocomplete/json?input' + text 

  }

  renderCard () {
    if(this.state.foundPlaces){
      return (
        <Display style={{flex: 1}} placeDetails={this.state.places[Math.ceil(Math.random() * this.state.places.length) - 1]}
        />
      );
    } else {
      if(this.state.findingResults){
        return (
          <Container style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Spinner color='blue' />
          </Container> 
        );  
      } else {
        return <View/>;
      }
      
    }
  }


  renderList () {
    if(this.state.foundPlaces){
      return (<List dataArray={this.state.places}
       renderRow={(place) =>
         <ListItem>
           <Text>{place.name}</Text>
         </ListItem>
       }>
       </List>);
    } else {
      if(this.state.findingResults){
        return (
          <Container style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Spinner color='blue' />
          </Container> 
        );  
      } else {
        return <View/>;
      }
      
    }
  }


  setPlaceQuery = (placeString) => {
    console.log(placeString)
    if(placeString.trim() != ''){
      this.setState({placeInput: placeString.split(' ').join('+')});
    }
  }

  render() {
    if (!this.state.fontLoaded) {
      return ( 
        <Container style={{alignItems: 'center', justifyContent: 'center'}}>
          <Spinner color='red' />
        </Container> 
      );
    }
    return (
      <Container style={{paddingTop: 25}}>
        key = {this.state.key};
        <GooglePlacesAutocomplete
                placeholder='Search'
                minLength={2} // minimum length of text to search
                autoFocus={false}
                returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
                listViewDisplayed='auto'    // true/false/undefined
                fetchDetails={true}
                renderDescription={(row) => row.description} // custom description render
                onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true
                  console.log(data);
                  console.log(details);
                }}
                getDefaultValue={() => {
                  return ''; // text input default value
                }}
                query={{
                  // available options: https://developers.google.com/places/web-service/autocomplete
                  key: ,
                  language: 'en', // language of the results
                  types: '(cities)', // default: 'geocode'
                }}
                styles={{
                  description: {
                    fontWeight: 'bold',
                  },
                  predefinedPlacesDescription: {
                    color: '#1faadb',
                  },
                }}

                currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
                currentLocationLabel="Current location"
                nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
                GoogleReverseGeocodingQuery={{
                  // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
                }}
                GooglePlacesSearchQuery={{
                  // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
                  rankby: 'distance',
                  types: 'food',
                }}


                filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities

                predefinedPlaces={[homePlace, workPlace]}

                debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
                renderLeftButton={() => <Image source={require('path/custom/left-icon')} />}
                renderRightButton={() => <Text>Custom text after the inputg</Text>}
              />
        <Item regular style={{marginLeft: 10, marginRight: 10, marginTop: 5}}>
          <Input 
            placeholder='Area Name' 
            onChangeText={(text) => this.setPlaceQuery(text)}
            style={{borderRadius: 4}}
          />
        </Item>
        <View style={{
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          borderWidth: 0,
          height: 80,
          marginTop: 5
          }
        }>
          <Button info style={styles.buttonStyle}>
            <Text>Find My location</Text>
          </Button>
          <Button primary onPress={(event) => { this.chooseRandomPlace(); Keyboard.dismiss();}} style={styles.buttonStyle}>
            <Text>Choose For Me!</Text>
          </Button>
        </View>
        {this.renderCard()}
        <ScrollView style={{flex: 1}}>
          {this.renderList()}
        </ScrollView>
        
      </Container>
    );
  }
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mainComponentsStyle: {
    flex: 1
  },

  textBoxStyle: {
    margin: 2
  },

  buttonStyle: {
    borderRadius: 8,
    margin: 15
  }
});
