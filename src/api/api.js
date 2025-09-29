import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token")
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
});

api.interceptors.response.use(
    response=> response,
    error=>{
        if(error.response?.status === 401){
            const currentPath = window.location.pathname
            if(currentPath !== '/auth'){
                localStorage.removeItem("token");
                localStorage.removeItem("userRole"); 
                localStorage.removeItem("userEmail");
                
                window.location.href = "/auth";
            }
        }

        return Promise.reject(error);
    }
);

export default api;