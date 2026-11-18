import { BRAND_NAME, CONTACT_PAGE, RING_START } from '../config'
import { goToPage } from '../store'

export default function Navbar({ onAbout }) {
  return (
    <header className="nav">
      <button type="button" className="logo" onClick={() => goToPage(0, false)} aria-label={BRAND_NAME + ' ana sayfa'}>
        <span className="word">the fuel</span>
        <span className="script">agency</span>
      </button>
      <nav aria-label="Ana menü">
        <ul>
          <li><button className="link" type="button" onClick={() => goToPage(RING_START + 1)}>[HİZMETLER]</button></li>
          <li><button className="link" type="button" onClick={onAbout}>[AJANS]</button></li>
          <li><button className="link" type="button" onClick={() => goToPage(CONTACT_PAGE)}>[İLETİŞİM]</button></li>
        </ul>
      </nav>
    </header>
  )
}
