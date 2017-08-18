import React from 'react';
import { StyleSheet, View, TextInput, ScrollView, Keyboard } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Spinner, Item, Input, List, ListItem} from 'native-base';
import Display from './components/Display';
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
    if(this.state.placeInput.trim() != ''){
      this.setState({ findingResults : true, foundPlaces: false, resultsUnfound: false });
      query = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.state.placeInput + '&key=' + key.value;
      axios.get(query)
        .then(response => {
          console.log(response.data.results)
          console.log(query)
          if(response.data.results.length !== 0){
            this.setState({ 
              locationLat: response.data.results[0].geometry.location.lat, 
              locationLong: response.data.results[0].geometry.location.lng  })

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
    }
  }


  renderCard() {
    if (this.state.foundPlaces) {
      console.log("Random number: " + this.state.randomNumber)
      let detail = this.state.places[this.state.randomNumber];
      console.log("Detail: "  + detail + "Name: " + detail.name)
      console.log("Places " + this.state.places + "END END")
      return (
        <View>
          <Text  style={{color: 'blue', fontSize: 40}}>{detail.name}</Text>
        </View>
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
      foundAutoComplete: false

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
          findingLocation: false
        });
        url_query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + position.coords.latitude + ',' + position.coords.longitude + '&rankby=distance&key=' + key.value;
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
            })
          
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
    return (
      <Container style={{paddingTop: 25, justifyContent: 'space-between', flex: 1}}>
        <Item regular style={{marginLeft: 10, marginRight: 10, marginTop: 5}}>
          <Input 
            onChangeText={(text) => {this.setPlaceQuery(text); console.log("Input changed"); this.getSuggestions(); this.setState({inputText: text})}}
            style={{borderRadius: 4}}
            value={this.state.inputText}
          />
        </Item>
        {this.showSuggestions()}
        {this.showLoadingLocation()}
        <View style={{
          flexDirection: 'row', 
          justifyContent: 'space-around', 
          borderWidth: 0,
          marginTop: 5
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
