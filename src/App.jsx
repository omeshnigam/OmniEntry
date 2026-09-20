import {
  useEffect,
  useRef,
  useState
} from "react";

import "./App.css";


const API_URL =
  "https://c2kgkuctfi.execute-api.us-east-1.amazonaws.com/prod";


function App() {

  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const canvasRef =
    useRef(null);


  const [cameraOn, setCameraOn] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [logsLoading, setLogsLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [employee, setEmployee] =
    useState(null);

  const [logs, setLogs] =
    useState([]);

  const [showLogs, setShowLogs] =
    useState(false);


  // ==========================================
  // START CAMERA
  // ==========================================

  const startCamera = async () => {

    try {

      const stream =
        await navigator.mediaDevices
          .getUserMedia({
            video: true
          });


      videoRef.current.srcObject =
        stream;

      streamRef.current =
        stream;

      setCameraOn(true);

      setMessage(
        "Camera is ready"
      );

    } catch (error) {

      console.error(error);

      setMessage(
        "Camera permission denied"
      );

    }

  };


  // ==========================================
  // GET CURRENT LOCATION
  // ==========================================

  const getCurrentLocation = () => {

    return new Promise(
      (resolve, reject) => {

        if (!navigator.geolocation) {

          reject(
            new Error(
              "Geolocation is not supported"
            )
          );

          return;

        }


        navigator.geolocation.getCurrentPosition(

          (position) => {

            resolve({

              latitude:
                position.coords.latitude,

              longitude:
                position.coords.longitude,

              accuracy:
                position.coords.accuracy

            });

          },

          (error) => {

            console.error(
              "Location error:",
              error
            );

            reject(error);

          },

          {

            enableHighAccuracy:
              true,

            timeout:
              15000,

            maximumAge:
              0

          }

        );

      }
    );

  };


  // ==========================================
  // VERIFY EMPLOYEE
  // ==========================================

  const verifyEmployee = async () => {

    if (!videoRef.current)
      return;


    try {

      setLoading(true);

      setEmployee(null);


      // ---------------------------------------
      // LOCATION REQUIRED
      // ---------------------------------------

      setMessage(
        "Getting your location..."
      );


      let location;


      try {

        location =
          await getCurrentLocation();

      } catch (error) {

        console.error(error);

        setMessage(
          "Location is required. Kindly enable location permission and try again."
        );

        return;

      }


      // ---------------------------------------
      // CAPTURE FACE
      // ---------------------------------------

      setMessage(
        "Location detected. Scanning face..."
      );


      const video =
        videoRef.current;

      const canvas =
        canvasRef.current;


      const maxWidth =
        640;


      const scale =
        Math.min(
          1,
          maxWidth /
            video.videoWidth
        );


      canvas.width =
        video.videoWidth *
        scale;


      canvas.height =
        video.videoHeight *
        scale;


      const ctx =
        canvas.getContext("2d");


      ctx.drawImage(

        video,

        0,

        0,

        canvas.width,

        canvas.height

      );


      const imageData =
        canvas.toDataURL(
          "image/jpeg",
          0.8
        );


      const base64Image =
        imageData.split(",")[1];


      // ---------------------------------------
      // SEND FACE + LOCATION
      // ---------------------------------------

      const response =
        await fetch(
          API_URL,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                action:
                  "verify",

                imageBytes:
                  base64Image,

                latitude:
                  location.latitude,

                longitude:
                  location.longitude,

                accuracy:
                  location.accuracy

              })

          }
        );


      const data =
        await response.json();


      console.log(
        "VERIFY:",
        data
      );


      // ---------------------------------------
      // LOCATION REQUIRED
      // ---------------------------------------

      if (
        data.locationRequired
      ) {

        setMessage(
          "Location is required. Kindly enable location permission and try again."
        );

        return;

      }


      // ---------------------------------------
      // VERIFIED
      // ---------------------------------------

      if (data.matched) {

        setEmployee(data);

        setMessage(
          "Identity verified successfully"
        );

        loadLogs();

      } else {

        setMessage(
          "No registered employee found"
        );

      }


    } catch (error) {

      console.error(error);

      setMessage(
        "Verification failed"
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================
  // LOAD LOGS
  // ==========================================

  const loadLogs = async () => {

    try {

      setLogsLoading(true);


      const response =
        await fetch(
          API_URL,
          {

            method:
              "POST",

            headers: {

              "Content-Type":
                "application/json"

            },

            body:
              JSON.stringify({

                action:
                  "logs"

              })

          }
        );


      const data =
        await response.json();


      if (data.success) {

        setLogs(
          data.logs || []
        );

        setShowLogs(true);

      }


    } catch (error) {

      console.error(error);

      setMessage(
        "Unable to load entry logs"
      );

    } finally {

      setLogsLoading(false);

    }

  };


  // ==========================================
  // MAP LINK
  // ==========================================

  const getMapLink = (
    latitude,
    longitude
  ) => {

    if (
      latitude == null ||
      longitude == null
    ) {

      return null;

    }


    return (
      `https://www.google.com/maps?q=` +
      `${latitude},${longitude}`
    );

  };


  // ==========================================
  // CLEANUP
  // ==========================================

  useEffect(() => {

    return () => {

      streamRef.current
        ?.getTracks()
        .forEach(
          (track) =>
            track.stop()
        );

    };

  }, []);


  return (

    <div className="app">

      {/* HEADER */}

      <header className="header">

        <div className="brand">

          <div className="brand-icon">
            🔐
          </div>

          <div>

            <h1>
              OmniEntry
            </h1>

            <p>
              Employee Face Authentication
            </p>

          </div>

        </div>


        <div className="aws-badge">
          Powered by AWS
        </div>

      </header>


      <main className="main">

        {/* CAMERA CARD */}

        <section className="camera-card">

          <div className="section-title">

            <div>

              <h2 >
                Employee Verification
              </h2>

              <p>
                Position your face inside the camera
              </p>

            </div>


            <div
              className={
                cameraOn
                  ? "camera-status online"
                  : "camera-status"
              }
            >

              <span />

              {cameraOn
                ? "Camera Active"
                : "Camera Offline"}

            </div>

          </div>


          <div className="camera-container">

            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={
                cameraOn
                  ? "video"
                  : "video hidden"
              }
            />


            {!cameraOn && (

              <div className="camera-placeholder">

                <div className="camera-icon">
                  📷
                </div>

                <h3>
                  Camera is off
                </h3>

                <p>
                  Start the camera to begin verification
                </p>

              </div>

            )}

          </div>


          <canvas
            ref={canvasRef}
            style={{
              display: "none"
            }}
          />


          <div className="action-buttons">

            {!cameraOn && (

              <button
                className="primary-button"
                onClick={startCamera}
              >
                📷 Start Camera
              </button>

            )}


            {cameraOn && (

              <button
                className="primary-button"
                onClick={verifyEmployee}
                disabled={loading}
              >

                {loading
                  ? "🔍 Verifying..."
                  : "🔍 Verify Employee"}

              </button>

            )}


            <button
              className="secondary-button"
              onClick={loadLogs}
              disabled={logsLoading}
            >

              📋{" "}

              {logsLoading
                ? "Loading..."
                : "View Entry Logs"}

            </button>

          </div>


          {message && (

            <div
              className={
                employee
                  ? "message success-message"
                  : "message"
              }
            >

              {employee
                ? "✓ "
                : ""}

              {message}

            </div>

          )}

        </section>


        {/* VERIFIED CARD */}

        {employee && (

          <section className="verified-card">

            <div className="verified-header">

              <div className="verified-icon">
                ✓
              </div>

              <div>

                <h2>
                  Employee Verified
                </h2>

                <p>
                  Identity successfully authenticated
                </p>

              </div>

            </div>


            <div className="employee-grid">


              <div className="info-box">

                <span>
                  Employee Name
                </span>

                <strong>
                  {employee.name}
                </strong>

              </div>


              <div className="info-box">

                <span>
                  Employee ID
                </span>

                <strong>
                  {employee.employeeId}
                </strong>

              </div>


              <div className="info-box">

                <span>
                  Match Similarity
                </span>

                <strong>
                  {Number(
                    employee.similarity
                  ).toFixed(2)}
                  %
                </strong>

              </div>


              <div className="info-box">

                <span>
                  Status
                </span>

                <strong className="verified-text">
                  ✓ Verified
                </strong>

              </div>


              <div className="info-box">

                <span>
                  Entry Date
                </span>

                <strong>
                  {employee.date}
                </strong>

              </div>


              <div className="info-box">

                <span>
                  Entry Time
                </span>

                <strong>
                  {employee.time} IST
                </strong>

              </div>


              {/* LOCATION */}

              <div className="info-box location-box">

                <span>
                  📍 Entry Location
                </span>

                <strong>
                  {employee.locationName ||
                    "Location unavailable"}
                </strong>


                {employee.latitude != null &&
                  employee.longitude != null && (

                    <div className="coordinates">

                      {Number(
                        employee.latitude
                      ).toFixed(6)}

                      {" , "}

                      {Number(
                        employee.longitude
                      ).toFixed(6)}

                    </div>

                  )}


                {employee.latitude != null &&
                  employee.longitude != null && (

                    <a
                      className="location-link"
                      href={getMapLink(
                        employee.latitude,
                        employee.longitude
                      )}
                      target="_blank"
                      rel="noreferrer"
                    >
                      🗺️ Open in Google Maps
                    </a>

                  )}

              </div>


              <div className="info-box">

                <span>
                  Location Accuracy
                </span>

                <strong>

                  {employee.accuracy != null

                    ? `${Math.round(
                        employee.accuracy
                      )} meters`

                    : "Unavailable"}

                </strong>

              </div>

            </div>

          </section>

        )}


        {/* LOGS */}

        {showLogs && (

          <section className="logs-card">

            <div className="logs-header">

              <div>

                <h2>
                  Entry Logs
                </h2>

                <p>
                  Employee verification history
                </p>

              </div>


              <button
                className="refresh-button"
                onClick={loadLogs}
              >
                ↻ Refresh
              </button>

            </div>


            <div className="table-wrapper">

              {logs.length === 0 ? (

                <div className="empty-state">
                  No entry logs found.
                </div>

              ) : (

                <table>

                  <thead>

                    <tr>

                      <th>
                        Employee
                      </th>

                      <th>
                        ID
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Entry Time
                      </th>

                      <th>
                        Similarity
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {logs.map(
                      (log) => (

                        <tr
                          key={
                            log.logId
                          }
                        >

                          <td>
                            <strong>
                              {log.name}
                            </strong>
                          </td>


                          <td>
                            {log.employeeId}
                          </td>


                          <td>
                            {log.date}
                          </td>


                          <td>
                            {log.time} IST
                          </td>


                          <td>

                            {log.similarity !== null

                              ? `${Number(
                                  log.similarity
                                ).toFixed(2)}%`

                              : "-"}

                          </td>


                          <td>

                            {log.latitude != null &&
                              log.longitude != null ? (

                              <div className="log-location">

                                <strong>
                                  {log.locationName}
                                </strong>

                                <a
                                  className="location-link"
                                  href={getMapLink(
                                    log.latitude,
                                    log.longitude
                                  )}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  🗺️ View
                                </a>

                              </div>

                            ) : (

                              <span>
                                Location unavailable
                              </span>

                            )}

                          </td>


                          <td>

                            <span className="status-badge">

                              ✓{" "}
                              {log.status}

                            </span>

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              )}

            </div>

          </section>

        )}

      </main>


      <footer>

        <p>
          OmniEntry • Made by Omesh Nigam
        </p>

      </footer>

    </div>

  );

}


export default App;