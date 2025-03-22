import React from 'react';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import SampleList from './components/SampleList';
import AddSample from './components/AddSample';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="App">
        <h1>Scientific Data System</h1>
        <AddSample />
        <SampleList />
      </div>
    </ApolloProvider>
  );
}

export default App;
