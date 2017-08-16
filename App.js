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
      inputText: ''
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
      query = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.state.placeInput + '&key=' + key.value;
      axios.get(query)
        .then(response => {
          console.log(response.data.results)
          console.log(query)
          this.setState({ 
            locationLat: response.data.results[0].geometry.location.lat, 
            locationLong: response.data.results[0].geometry.location.lng  })

          query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.state.locationLat + ',' + this.state.locationLong + '&radius=500&type=restaurant&key=' + key.value
          axios.get(query)
            .then(response => {
              this.setState({
                foundPlaces: true,
                findingResults: false,
                places: response.data.results
              })
              console.log(response.data.results.length)
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
    console.log(placeString);
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
          console.log(response.data.predictions.length)
      })
    }
  }

  showSuggestions () {
    if(this.state.foundAutoComplete){
      return ( 
        <List dataArray={this.state.autocompleteSuggestions}
        renderRow={(prediction) => 
            <ListItem onPress={() => {this.setState({
              suggestionSelected: true, 
              inputText: prediction.description
            })}}>
              <Text>{prediction.description}</Text>
            </ListItem>
        }>
        </List>
        );

    } else {
      return <View/>;
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
      <Container style={{paddingTop: 25, justifyContent: 'space-between'}}>
        <Item regular style={{marginLeft: 10, marginRight: 10, marginTop: 5}}>
          <Input 
            onChangeText={(text) => {this.setPlaceQuery(text); this.getSuggestions(); this.setState({inputText: text})}}
            style={{borderRadius: 4}}
            value={this.state.inputText}
          />
        </Item>
        {this.showSuggestions()}
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
