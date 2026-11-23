import { Link } from "react-router-dom";
function ReturnButton(){

    return(
        <Link to="/dashboard">
            <button>Wroc na Strone Główną</button>
        </Link>
    )
}
export default ReturnButton;