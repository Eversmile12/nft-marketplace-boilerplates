import '../styles/globals.css'
import Nav from './components/nav'
function Marketplace({ Component, pageProps }) {
  return (
    <>
      <Nav></Nav>
      <Component {...pageProps} />
    </>
  )
}

export default Marketplace
