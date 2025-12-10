import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStores } from '../features/store/storeSlice';
import FilterStore from './FilterStore';

const StoreList = () => {
  const dispatch = useDispatch();
  const { list, status } = useSelector((state) => state.stores);
  const [filtered, setFiltered] = useState([]);

  const handleFilter = (params) => {
    dispatch(fetchStores(params));
  };

  useEffect(() => {
    dispatch(fetchStores({}));
  }, [dispatch]);

  useEffect(() => {
    setFiltered(list);
  }, [list]);

  return (
    <div className="container py-4">
      <div className="text-center mb-4">
        <h1 className="h3 text-success">Tìm cửa hàng gần bạn</h1>
        <p className="text-muted">Chọn khu vực để xem danh sách cửa hàng tại Quy Nhơn</p>
      </div>

      <div className="card p-3 mb-4">
        <FilterStore onFilter={handleFilter} />
      </div>

      <div>
        {status === 'loading' ? (
          <p className="text-center text-secondary">Đang tải danh sách cửa hàng...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted">Không tìm thấy cửa hàng phù hợp.</p>
        ) : (
          <div className="row g-4">
            {filtered.map((store) => (
              <div key={store.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title text-success">{store.name}</h5>
                    <p className="card-text">{store.address}</p>
                    <p className="text-muted small">{store.ward}, {store.district}, {store.city}</p>
                    <p className="text-primary small">SĐT: {store.phone}</p>
                    <a
                      href={`http://localhost:3000/store/${store.id}`}
                      className="btn btn-primary btn-sm"  
                      role="button"
                    >
                      Xem cửa hàng
                    </a>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreList;
