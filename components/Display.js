import React from 'react';
import { Card, CardItem, Text, Body} from 'native-base';

const Display = ({ placeDetails }) => {

  return (
    <Card>
            <CardItem header>
              <Text>{placeDetails.name}</Text>
            </CardItem>
            <CardItem>
              <Body>
                <Text>
                  This place is called {placeDetails.name}
                </Text>
              </Body>
            </CardItem>
            <CardItem footer>
              <Text>{placeDetails.rating}</Text>
            </CardItem>
	 </Card> 
  );
};

export default Display;
