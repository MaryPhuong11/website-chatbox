import { useEffect, useState } from "react";
import axios from "axios";

const UserInfo = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [preview, setPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios.get(`/api/users/${userId}`).then((res) => {
      const data = res.data.user || res.data;
      setUser(data);
      setPreview(data.avatar || "");
    });
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      let avatarUrl = user.avatar;

      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadRes = await axios.post("/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        avatarUrl = uploadRes.data.url;
      }

      const { name, phone, address } = user;
      await axios.put(`/api/users/${userId}`, {
        name,
        phone,
        address,
        avatar: avatarUrl,
      });

      alert("Cập nhật thành công!");
      setEditMode(false);
    } catch (err) {
      alert("Có lỗi khi cập nhật thông tin!");
      console.error(err);
    }
  };

  if (!user) return <p className="text-center py-4">Đang tải dữ liệu người dùng...</p>;

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 text-success">Thông tin người dùng</h2>
      <div className="card shadow p-4">
        <div className="text-center mb-4">
          <img
            src={preview || "https://i.pravatar.cc/150?img=12"}
            alt="Avatar"
            className="rounded-circle border border-success"
            width="150"
            height="150"
          />
          {editMode && (
            <>
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="form-control mt-2" />
              <small className="text-muted">Tải ảnh đại diện mới</small>
            </>
          )}
        </div>
        <div className="mb-3">
          <label className="form-label">Tên</label>
          <input
            type="text"
            name="name"
            value={user.name || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input type="email" value={user.email} disabled className="form-control-plaintext" readOnly />
        </div>
        <div className="mb-3">
          <label className="form-label">Số điện thoại</label>
          <input
            type="text"
            name="phone"
            value={user.phone || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <label className="form-label">Địa chỉ</label>
          <input
            type="text"
            name="address"
            value={user.address || ""}
            onChange={handleChange}
            disabled={!editMode}
            className="form-control"
          />
        </div>
        <div className="text-end">
          {editMode ? (
            <>
              <button className="btn btn-success me-2" onClick={handleSave}>
                Lưu
              </button>
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                Hủy
              </button>
            </>
          ) : (
            <button className="btn btn-primary" onClick={() => setEditMode(true)}>
              Chỉnh sửa
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
