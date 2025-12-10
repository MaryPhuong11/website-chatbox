import { useEffect, useState } from "react";
import axios from "axios";

const FilterStore = ({ onFilter }) => {
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/area/districts").then(res => {
      setDistricts(res.data);
    });
  }, []);

  useEffect(() => {
    if (district) {
      axios.get(`http://localhost:5000/api/area/wards/${district}`).then(res => {
        setWards(res.data);
      });
    } else {
      setWards([]);
      setWard("");
    }
  }, [district]);

  const handleSearch = () => {
    onFilter({ district, ward });
  };

  return (
    <form
      className="row g-3 align-items-end"
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <div className="col-md-5">
        <label htmlFor="districtSelect" className="form-label">
          Tỉnh/Thành phố
        </label>
        <select
          className="form-select"
          id="districtSelect"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
        >
          <option value="">-- Chọn Tỉnh/Thành phố --</option>
          {districts.map((d, idx) => (
            <option key={idx} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-5">
        <label htmlFor="wardSelect" className="form-label">
          Phường / Xã
        </label>
        <select
          className="form-select"
          id="wardSelect"
          value={ward}
          onChange={(e) => setWard(e.target.value)}
          disabled={!wards.length}
        >
          <option value="">-- Chọn phường/xã --</option>
          {wards.map((w, idx) => (
            <option key={idx} value={w}>
              {w}
            </option>
          ))}
        </select>
      </div>

      <div className="col-md-2 d-grid">
        <button type="submit" className="btn btn-success">
          Tìm kiếm
        </button>
      </div>
    </form>
  );
};

export default FilterStore;
