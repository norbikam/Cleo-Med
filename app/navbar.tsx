import { Button } from "react-bootstrap";

function Navigation() {
  return (
    <div>
    <table className="navbartable">
      <thead>
      <th className="navbartable-left">
      <a href="#"><h1>Cleo Med</h1></a>
      </th>
      <th className="navbartable-right">
      <ul className="navbuttons">
        <a href="#"><li>Button1</li></a>
        <a href="#"><li>Button1</li></a>
        <a href="#"><li>Button1</li></a>
      </ul>
      </th>
      </thead>
    </table>
    </div>
  );
}

export default Navigation;