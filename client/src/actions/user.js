import axios from "axios";
import { setUser } from "../reducers/userReducer";

export const registration = async (email, password) => {
  try {
    const response = await axios.post(
      `http://localhost:5000/api/auth/registration`,
      {
        email,
        password,
      }
    );
    alert(response.data.message);
  } catch (e) {
    alert(e?.response?.data.message);
  }
};

export const login = (email, password) => {
  return async (dispatch) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auth/login`,
        {
          email,
          password,
        }
      );
      localStorage.setItem("token", response.data.token);
      dispatch(setUser(response.data.user));
    } catch (e) {
      alert(e?.response?.data.message);
    }
  };
};

export const auth = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/auth`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      dispatch(setUser(response.data.user));
      localStorage.setItem("token", response.data.token);
    } catch (e) {
      localStorage.removeItem("token");
    }
  };
};

export const uploadAvatar =  (file) => {
  return async dispatch => {
      try {
          const formData = new FormData()
          formData.append('file', file)
          const response = await axios.post(`http://localhost:5000/api/files/avatar`, formData,
              {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
          )
          dispatch(setUser(response.data))
      } catch (e) {
          console.log(e)
      }
  }
}

export const deleteAvatar =  () => {
  return async dispatch => {
      try {
          const response = await axios.delete(`http://localhost:5000/api/files/avatar`,
              {headers:{Authorization:`Bearer ${localStorage.getItem('token')}`}}
          )
          dispatch(setUser(response.data))
      } catch (e) {
          console.log(e)
      }
  }
}