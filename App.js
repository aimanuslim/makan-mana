import React from 'react';
import { StyleSheet, View, TextInput, ScrollView } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Spinner, Item, Input, List, ListItem} from 'native-base';
import { Font } from 'expo';
import axios from 'axios';


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
      findingResults: false

    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'Roboto_medium': require('./node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    this.setState({ fontLoaded: true });
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
      query = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + this.state.placeInput + '&key=AIzaSyBhv0g9r-mtRqAEywP8bF8HSXvO0P9Wfro';
      axios.get(query)
        .then(response => {
          console.log(response.data.results[0].geometry)
          console.log(query)
          this.setState({ 
            locationLat: response.data.results[0].geometry.location.lat, 
            locationLong: response.data.results[0].geometry.location.lng  })

          query = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=' + this.state.locationLat + ',' + this.state.locationLong + '&radius=500&type=restaurant&key=AIzaSyBhv0g9r-mtRqAEywP8bF8HSXvO0P9Wfro'
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
        <Item regular>
          <Input 
            placeholder='Postcode' 
              />
        </Item>
        <Item regular>
          <Input 
            placeholder='Area Name' 
            onChangeText={(text) => this.setPlaceQuery(text)}
          />
        </Item>
        <Button full onPress={this.getPlacesList}>
          <Text>Choose For Me!</Text>
        </Button>
        <ScrollView>
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
  }
});
