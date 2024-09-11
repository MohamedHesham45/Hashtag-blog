import React from 'react'
import { Navigate } from 'react-router-dom'

export default function ProdectedRouter(props) {
  if (!props.isLogin) {
    return <Navigate to="/" />
  }
  return (
    <>
      {props.children}
    </>
  )
}
