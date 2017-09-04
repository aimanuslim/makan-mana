import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, Keyboard, TouchableOpacity } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Spinner, Item, Input, List, ListItem, Card, CardItem} from 'native-base';
import Display from './components/Display';
import Autocomplete from 'react-native-autocomplete-input';
import { Font } from 'expo';
import Expo from 'expo'
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
      autocompleteSuggestions: [],
      foundAutoComplete: false,
      inputText: '',
      resultsUnfound: false,
      myLatitude: null,
      myLongitude: null,
      locationError: null,
      foundMyLocation: true
    };
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
    if(this.state.placeInput.trim() != '' || this.state.useLongLat !== false){
      this.setState({ findingResults : true, foundPlaces: false, resultsUnfound: false });

      if(!this.state.useLongLat) {
        query = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.state.placeInput + '&key=' + key.value;
        axios.get(query)
          .then(response => {
            console.log(response.data.results)
            console.log(query)
            if(response.data.results.length !== 0){
              this.setState({ 
                locationLat: response.data.results[0].geometry.location.lat, 
                locationLong: response.data.results[0].geometry.location.lng,
                myLatitude: response.data.results[0].geometry.location.lat,
                myLongitude: response.data.results[0].geometry.location.lng

                  })

              query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.state.locationLat + ',' + this.state.locationLong + '&radius=500&type=restaurant&key=' + key.value
              axios.get(query)
                .then(response => {
                  if(response.data.results.length !== 0){
                    this.setState({
                      foundPlaces: true,
                      findingResults: false,
                      places: response.data.results,
                      randomNumber: Math.ceil(Math.random() * response.data.results.length) - 1

                    }) 
                    console.log("No results found for nearby") 
                  } else {
                    this.setState({resultsUnfound: true})
                  }
                  console.log(response.data.results.length)
                });
              } else {
                this.setState({ findingResults : false});
                console.log("No Results found for text search")
              }
          });
        } else {
          query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.state.myLatitude + ',' + this.state.myLongitude + '&radius=500&type=restaurant&key=' + key.value
          axios.get(query)
            .then(response => {
              if(response.data.results.length !== 0){
                this.setState({
                  foundPlaces: true,
                  findingResults: false,
                  places: response.data.results,
                  randomNumber: Math.ceil(Math.random() * response.data.results.length) - 1
                }) 
                console.log("No results found for nearby") 
              } else {
                this.setState({resultsUnfound: true})
              }
              console.log(response.data.results.length)
            });
        }
    }
  }

  



  renderCard() {
    if (this.state.foundPlaces) {
      console.log("Random number: " + this.state.randomNumber)
      let detail = this.state.places[this.state.randomNumber];
      var distance;
      if(this.state.myLongitude == null){
        distance = 0;
      } else {
        distance = findDistance(detail.geometry.location, {lat : this.state.myLatitude, lng : this.state.myLongitude});
      }
      console.log("Detail: "  + detail + " Name: " + detail.name)
      console.log("Places " + this.state.places + "END END")
      return (
        <Card style={{height: 30}}>
          <CardItem>
            <Body>
              <Text  style={{color: 'blue', fontSize: 25}}>{detail.name}</Text>
              <Text  style={{color: 'green', fontSize: 15}}>Absolute distance: {(distance * 1000).toFixed(2)} m</Text>
            </Body>
          </CardItem>
        </Card>
      );
    } else if (this.state.resultsUnfound) {
      return (<Text>Results cannot be found. Please try again</Text>);
    }
    else {
      if(this.state.findingResults){
        return (
          <Container style={{alignItems: 'center', justifyContent: 'center', flex: 1, flexDirection: 'column'}}>
            <Text>Finding list of locations..</Text>
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
      return <View/>
      {/*if(this.state.findingResults){
        return (
          <Container style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Spinner color='blue' />
          </Container> 
        );  
      } else {
        return <View/>;
      }*/}
      
    }
  }


  setPlaceQuery = (placeString) => {
    console.log("Placestring: " + placeString);
    if(placeString.trim() != ''){
      this.setState({placeInput: placeString.split(' ').join('+')});
    }
    this.setState({
      foundAutoComplete: false,
      useLongLat: false
    })

  }

  getSuggestions = () => {
    if (this.state.placeInput.trim() !== '') {
      query = 'https://maps.googleapis.com/maps/api/place/queryautocomplete/json?input=' + this.state.placeInput + '&key=' + key.value;
      axios.get(query)
        .then(response => {
          this.setState({
            autocompleteSuggestions: response.data.predictions,
            foundAutoComplete: true,
            suggestionSelected: false

          })
          console.log('getSuggestions: length = ' +  response.data.predictions.length)
          console.log('getSuggestions: data = ' +  response.data.predictions)
      })
    }
  }

  getMyLocation () {
    this.setState({foundMyLocation: false, findingLocation: true})
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          myLatitude: position.coords.latitude,
          myLongitude: position.coords.longitude,
          locationError: null,
          foundMyLocation: true,
          findingLocation: false,
          useLongLat: true,
          inputText: position.coords.latitude.toString() + "," + position.coords.longitude.toString()
        });
        {/*url_query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + position.coords.latitude + ',' + position.coords.longitude + '&rankby=distance&key=' + key.value;
        axios.get(url_query)
          .then((response) => {
            if(response.data.results.length != 0){
              let closestPlace = response.data.results[0]
              this.setState({
                inputText: closestPlace.name,
                placeInput: closestPlace.name
              })  
            } else {
              console.log("Unable to find place from myLocation lat and long")
            }
            })*/}
          
        console.log("lat: " + this.state.myLatitude + " long: "  + this.state.myLongitude + " error: " + this.state.error)
      },
      (error) => this.setState({locationError: error.message}),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
    

  }

  showSuggestions () {
    console.log("in showSuggestions")
    if(this.state.foundAutoComplete){
      return ( 
        <List dataArray={this.state.autocompleteSuggestions}
        renderRow={(prediction) => 
            <ListItem onPress={() => {Keyboard.dismiss(); this.setPlaceQuery(prediction.description); this.setState({
              suggestionSelected: true, 
              inputText: prediction.description
            })}}>
              <Text>{prediction.description}</Text>
            </ListItem>
        }>
        </List>
        );

    } else {
      return null;
    }
  }

  showLoadingLocation () {
    if(this.state.findingLocation) {
      return (
        <Container style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'row'}}>
          <Text> Finding your location ... </Text>
          <Spinner color='yellow' />
        </Container> 
        );
    } else {
        return null;
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

    const typedText  = this.state.inputText;
    const suggestions  = this.state.autocompleteSuggestions;

    return (

      <Container style={{marginTop: Expo.Constants.statusBarHeight}}>
        <Header>
          <Left/>
            <Body>
              <Title>Makan mana?</Title>
            </Body>
          <Right/>
        </Header>
        {/*<Item regular style={{marginLeft: 10, marginRight: 10, marginTop: 5}}>
          <Input 
            onChangeText={(text) => {this.setPlaceQuery(text); console.log("Input changed"); this.getSuggestions(); this.setState({inputText: text})}}
            style={{borderRadius: 4}}
            value={this.state.inputText}
          />
        </Item>*/}
        <View style={styles.formContainer}>
          <Autocomplete
            autoCapitalize="none"
            autoCorrect={false}
            data={suggestions}
            defaultValue={typedText}
            onChangeText={(text) => {this.setPlaceQuery(text); console.log("Input changed"); this.getSuggestions(); this.setState({inputText: text}); console.log("Found places: " + this.state.autocompleteSuggestions)}}
            placeholder="Enter area name"
            listContainerStyle={{padding: 5, zIndex: 10}}
            containerStyle={{zIndex: 10}}
            hideResults={this.state.suggestionSelected}
            renderItem={( prediction ) => (
                <TouchableOpacity onPress={() => {
                  Keyboard.dismiss();
                  this.setPlaceQuery(prediction.description);
                  this.setState({
                    suggestionSelected: true,
                    inputText: prediction.description
                  });
                  }}>
                  <Text style={styles.itemText}>
                    {prediction.description}
                  </Text>
                </TouchableOpacity>
            )}
          />
        </View>
        {/*{this.showSuggestions()}*/}
        {this.showLoadingLocation()}
        <View style={{
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          borderWidth: 0,
          marginTop: 5,
          zIndex: 1
          }
        }>
          <Button info style={styles.buttonStyle} onPress={(event) => {this.getMyLocation()}}>
            <Text>Find My location</Text>
          </Button>
          <Button primary onPress={(event) => { this.getPlacesList(); Keyboard.dismiss();}} style={styles.buttonStyle}>
            <Text>Choose For Me!</Text>
          </Button>
        </View>
        {this.renderCard()}
        {this.renderList()}
        {/*<ScrollView style={{flex: 1}}>
          
        </ScrollView>*/}
        
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
  formContainer: {
    backgroundColor: '#F5FCFF',
    flex: 1,
    paddingTop: 5,
    margin: 10,
    zIndex: 10
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

  itemText: {
    fontSize: 15,
    margin: 2
  },
  buttonStyle: {
    borderRadius: 8,
    margin: 15
  }

});


function findDistance(location1, location2){
      var lat1  = location1.lat;
      var lat2  = location2.lat;
      var lon1  = location1.lng;
      var lon2  = location2.lng;
      console.log("lat1: " + lat1 + " lat2: " + lat2 + " lon1: " + lon1 + " lon2: " + lon2);

      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1); 
      var a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ; 
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      var d = R * c; // Distance in km
      return d;

}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}



