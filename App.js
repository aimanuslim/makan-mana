import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Spinner, Item, Input, List, ListItem} from 'native-base';
import { Font } from 'expo';
import axios from 'axios';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      fontLoaded: false, 
      textToShow: 'original',
      places: []
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
    axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-33.8670522,151.1957362&radius=500&type=restaurant&keyword=cruise&key=AIzaSyBhv0g9r-mtRqAEywP8bF8HSXvO0P9Wfro')
      .then(response => {
        console.log(response.data.results)
        this.setState({ places: response.data.results })
      });
  }

  renderPlaces () {
    return this.state.places.map(place => <Text>{place.name}</Text>)
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
        <Header>
          <Left>
            <Button transparent>
              <Icon name='menu' />
            </Button>
          </Left>
          <Body>
            <Title>Makan Mana?</Title>
          </Body>
          <Right />
        </Header>
        <Content>
          <Item regular>
            <Input placeholder='Postcode' />
          </Item>
          <Item regular>
            <Input placeholder='Area Name' />
          </Item>
          <Button full onPress={this.getPlacesList}>
            <Text>Choose For Me!</Text>
          </Button>
           <List dataArray={this.state.places}
            renderRow={(place) =>
              <ListItem>
                <Text>{place.name}</Text>
              </ListItem>
            }>
            </List>
        </Content>


        <Footer>
          <FooterTab>
            <Button full>
              <Text>Footer</Text>
            </Button>
          </FooterTab>
        </Footer>
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
