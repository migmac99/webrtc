import React from 'react'
import { BrowserRouter, Route, Switch } from 'react-router-dom'

import CreateRoom from './Pages/CreateRoom'
import Room from './Pages/Room'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path='/' exact component={CreateRoom} />
        <Route path='/room/:roomID' component={Room} />
      </Switch>
    </BrowserRouter>
  )
}

export default App
