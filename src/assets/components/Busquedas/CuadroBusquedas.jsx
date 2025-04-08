import { InputGroup, Form } from "react-bootstrap";

import "bootstrap-icons/font/bootstrap-icons.css";




const CuadroBusqueda = ({ searchText, handleSearchChange }) => {


    return (


        <InputGroup className="mb-3" style={{width: "400px"}}>
        <InputGroup.Text>
        <i className="bi bi-search "></i>
        </InputGroup.Text>
        <Form.Control type="text "
        placeholder = "Buscar ..."
        value= {searchText}
        onChange= {handleSearchChange}>
        </Form.Control> 
        </InputGroup>

    );

}

export default CuadroBusqueda;