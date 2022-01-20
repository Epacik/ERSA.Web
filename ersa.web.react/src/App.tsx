import React, { useState } from 'react';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ApiKeyDialog from './components/ApiKeyDialog';
import { AdminApi } from './lib/Client/js/adminApi.mjs';
import LinkList from './components/LinkList';

enum AppState {
  AskForKey,
  LinkList
}


function App() {
  let initialState = AppState.LinkList;
  const key = localStorage.getItem(AdminApi.Client.localStorageItemKey);

  if(key === undefined || key === null || key.trim() === "") {
    initialState = AppState.AskForKey;
  }

  const [state, setState] = useState(initialState);
  
  testConnection();

  if(state === AppState.AskForKey) {
    return (
      <ApiKeyDialog keyUpdated={() => handleKeyUpdated()}/>
    );
  }

  return <LinkList/>;

  
  async function handleKeyUpdated() {
    setState(AppState.LinkList);
  }

  async function testConnection() {
    const client = new AdminApi.Client(key);
    const response = await client.testConnectionAsync();
    if(!response.success) {
      setState(AppState.AskForKey);
    }
  }
}

export default App;
