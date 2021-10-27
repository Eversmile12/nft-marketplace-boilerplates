import Link from "next/link"

function Nav(){
    return(
        <nav>
            <p>
                Vitto's NFT
            </p>
            <div>
                <Link href="#">
                    <a>
                        Sell Digital Asset
                    </a>
                </Link>
                <Link href="/create-item">
                    <a>
                        My Digital Assets
                    </a>
                </Link>
                <Link href='/creator-dashboard'>
                    Creator Dashboard
                </Link>
            </div>
        </nav>
    )
}

export default Nav;