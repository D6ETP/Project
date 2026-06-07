import { useNavigate } from "react-router-dom";
import "./Packages.css";
//added
import goa from "../assets/goa.jpg";
import lonavala from "../assets/lonavala.jpg";
import konkan from "../assets/konkan.jpg";
import manali from "../assets/manali.jpg";
import kashmir from "../assets/kashmir.jpg";
import jaipur from "../assets/jaipur.jpg";
import kerala from "../assets/kerala.jpg";
import ooty from "../assets/ooty.jpg";
import shimla from "../assets/shimla.jpg";
import mahabaleshwar from "../assets/mahabaleshwar.jpg";
import andaman from "../assets/andaman.jpg";
import udaipur from "../assets/udaipur.jpg";
import tirupati from "../assets/tirupati.jpg";
import shirdi from "../assets/shirdi.jpg";
import pandharpur from "../assets/pandharpur.jpg";
import kedarnath from "../assets/kedarnath.jpg";

function PackagesPage() {
  const navigate = useNavigate();

  const packages = [
    { id: 1, name: "🏖 Goa Summer Package", location: "Goa", price: 4999, image: goa },
    { id: 2, name: "🌄 Lonavala Weekend", location: "Lonavala", price: 2999, image: lonavala },
    { id: 3, name: "🌊 Konkan Coast Tour", location: "Ratnagiri", price: 5999, image: konkan },
    { id: 4, name: "🏔 Manali Adventure", location: "Manali", price: 7999, image: manali },
    { id: 5, name: "❄ Kashmir Paradise", location: "Srinagar", price: 9999, image: kashmir },
    { id: 6, name: "🏰 Jaipur Heritage Tour", location: "Jaipur", price: 5499, image: jaipur },
    { id: 7, name: "🚤 Kerala Backwaters", location: "Alleppey", price: 8499, image: kerala },
    { id: 8, name: "🌿 Ooty Hill Station", location: "Ooty", price: 4499, image: ooty },
    { id: 9, name: "⛄ Shimla Snow Escape", location: "Shimla", price: 6999, image: shimla },
    { id: 10, name: "🍓 Mahabaleshwar Retreat", location: "Mahabaleshwar", price: 3999, image: mahabaleshwar },
    { id: 11, name: "🏝 Andaman Island Tour", location: "Port Blair", price: 12999, image: andaman },
    { id: 12, name: "👑 Udaipur Royal Trip", location: "Udaipur", price: 7499, image: udaipur },
    { id: 13, name: "🛕 Tirupati Temple Darshan", location: "Tirupati", price: 3499, image: tirupati },
    { id: 14, name: "🙏 Shirdi Sai Darshan", location: "Shirdi", price: 2999, image: shirdi },
    { id: 15, name: "🚩 Pandharpur Yatra", location: "Pandharpur", price: 2499, image: pandharpur },
    { id: 16, name: "🕉 Kedarnath Pilgrimage", location: "Kedarnath", price: 11999, image: kedarnath },
  ];

  return (
    <div className="packages-container">
      <h1 className="packages-title">
        Explore Dream Destinations 🚌 
      </h1>

      <div className="packages-grid">
        {packages.map((pkg) => (
          <div className="package-card" key={pkg.id}>
            <img src={pkg.image} alt={pkg.name} />

            <div className="package-content">
              <h2>{pkg.name}</h2>

              <p>📍 {pkg.location}</p>

              <p className="price">₹ {pkg.price}</p>

              <button
                className="book-btn"
                onClick={() =>
                  navigate("/package-form", {
                    state: pkg,
                  })
                }
              >
                Book Package
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PackagesPage;