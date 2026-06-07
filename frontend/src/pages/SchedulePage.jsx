import { useState } from "react";
import { getSchedules } from "../services/scheduleService";
import ScheduleCard from "../components/ScheduleCard";
import "../styles/SchedulePage.css";

function SchedulePage() {
  const schedules = getSchedules();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busType, setBusType] = useState("");

  const [filteredBuses, setFilteredBuses] =
    useState(schedules);

  const handleSearch = () => {
    const result = schedules.filter((bus) => {
      const matchFrom = bus.from
        .toLowerCase()
        .includes(from.toLowerCase());

      const matchTo = bus.to
        .toLowerCase()
        .includes(to.toLowerCase());

      const matchType =
        busType === ""
          ? true
          : bus.busType === busType;

      return (
        matchFrom &&
        matchTo &&
        matchType
      );
    });

    setFilteredBuses(result);
  };

  const handleReset = () => {
    setFrom("");
    setTo("");
    setBusType("");
    setFilteredBuses(schedules);
  };

  return (
    <div className="schedule-page">
  <div className="container pt-4">
    </div>

      {/* Heading */}

      <div className="text-center mb-4">
       <h1 className="schedule-title">
          🚌 Bus Search
        </h1>

        <p className="schedule-subtitle">
          Search and Book Your Bus
        </p>
      </div>

      {/* Search Section */}

      <div className="card shadow-lg p-4 mb-5 search-box">

        <div className="row g-3 align-items-center">

          <div className="col-md-3">

            <input
              type="text"
              className="form-control"
              placeholder="From"
              value={from}
              onChange={(e) =>
                setFrom(e.target.value)
              }
            />

          </div>

          <div className="col-md-3">

            <input
              type="text"
              className="form-control"
              placeholder="To"
              value={to}
              onChange={(e) =>
                setTo(e.target.value)
              }
            />

          </div>

          <div className="col-md-3">

            <select
              className="form-select"
              value={busType}
              onChange={(e) =>
                setBusType(e.target.value)
              }
            >
              <option value="">
                All Types
              </option>

              <option value="AC Sleeper">
                AC Sleeper
              </option>

              <option value="AC Seater">
                AC Seater
              </option>

              <option value="Luxury AC">
                Luxury AC
              </option>

              <option value="Sleeper">
                Sleeper
              </option>

            </select>

          </div>

          <div className="col-md-3">

            <button
              className="btn btn-primary me-2"
              onClick={handleSearch}
            >
              Search
            </button>

            <button
              className="btn btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>

          </div>

        </div>

      </div>

      {/* Results */}

      <div className="mb-4">

        <h5 className="result-count">
          Total Buses Found :
          {" "}
          {filteredBuses.length}
        </h5>

      </div>

      {filteredBuses.length === 0 ? (

        <div className="alert alert-danger no-bus-alert">
          No buses found.
        </div>

      ) : (

        filteredBuses.map((bus) => (
          <ScheduleCard
            key={bus.id}
            bus={bus}
          />
        ))

      )}

    </div>
  );
}

export default SchedulePage;