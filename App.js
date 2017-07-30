import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { Container, Header, Title, Content, Footer, FooterTab, Button, Left, Right, Body, Icon, Text, Spinner, Item, Input } from 'native-base';
import { Font } from 'expo';


export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      fontLoaded: false
    };
  }

  async componentDidMount() {
    await Font.loadAsync({
      'Roboto_medium': require('./node_modules/native-base/Fonts/Roboto_medium.ttf'),
    });

    this.setState({ fontLoaded: true });
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
          <Button full>
            <Text>Choose For Me!</Text>
          </Button>
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
