import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { Map, Marker, TileLayer } from "react-leaflet";
import { LeafletMouseEvent } from "leaflet";
import { useHistory } from "react-router-dom";
import { useToasts } from "react-toast-notifications";

import { FiPlus, FiX } from "react-icons/fi";

import Sidebar from "../components/Sidebar";
import happyMapIcon from "../utils/mapIcon";
import api from "../services/api";

import "../styles/pages/create-orphanage.css";

export default function CreateOrphanage() {
  const { addToast } = useToasts();
  const history = useHistory();

  const [initialPosition, setInitialPosition] = useState({
    latitude: 0,
    longitude: 0,
  });
  const [position, setPosition] = useState({ latitude: 0, longitude: 0 });

  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [instructions, setInstructions] = useState("");
  const [opening_hours, setOpeninHours] = useState("");
  const [open_on_weekends, setOpenOnWeekends] = useState(true);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const [isWithError, setIsWithError] = useState(false);

  function handleMapClick(event: LeafletMouseEvent) {
    const { lat, lng } = event.latlng;
    setPosition({
      latitude: lat,
      longitude: lng,
    });
  }

  function handleSelectImages(event: ChangeEvent<HTMLInputElement>) {
    console.log(event.target.files);
    if (!event.target.files?.length) {
      return;
    }

    const selectedImages = Array.from(event.target.files);

    const addingSelectedImages = [...images, ...selectedImages];

    setImages(addingSelectedImages);

    const selectedImagesPreview = addingSelectedImages.map((image) =>
      URL.createObjectURL(image)
    );

    setPreviewImages(selectedImagesPreview);
  }

  function handleRemoveImage(index: number) {
    const newImagesArray = images.filter((_, idx) => idx !== index);

    setImages(newImagesArray);

    const selectedImagesPreview = newImagesArray.map((newImage) =>
      URL.createObjectURL(newImage)
    );

    setPreviewImages(selectedImagesPreview);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { latitude, longitude } = position;

    const data = new FormData();

    data.append("name", name);
    data.append("about", about);
    data.append("latitude", String(latitude));
    data.append("longitude", String(longitude));
    data.append("instructions", instructions);
    data.append("opening_hours", opening_hours);
    data.append("open_on_weekends", String(open_on_weekends));

    images.forEach((image) => {
      data.append("images", image);
    });

    try {
      await api.post("/orphanages", data);
    } catch (error) {
      const messages = Object.values(error.response.data);
      console.log(messages);
      addToast("Campo obrigatório em destaque", { appearance: "error" });
      setIsWithError(true);
      return console.log(error.response.data);
    }

    addToast("Cadastro realizado com sucesso", { appearance: "success" });

    history.push("/app");
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function (position) {
      let lat = position.coords.latitude;
      let long = position.coords.longitude;

      console.log(lat, long);

      setInitialPosition({ latitude: lat, longitude: long });
    });
  }, []);

  return (
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form onSubmit={handleSubmit} className="create-orphanage-form">
          <fieldset>
            <legend>Dados</legend>

            <Map
              center={[initialPosition.latitude, initialPosition.longitude]}
              style={{ width: "100%", height: 280 }}
              zoom={15}
              onclick={handleMapClick}
              className={
                isWithError && !position.latitude && !position.longitude
                  ? "empty-field"
                  : ""
              }
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
              />

              {position.latitude !== 0 && (
                <Marker
                  interactive={false}
                  icon={happyMapIcon}
                  position={[position.latitude, position.longitude]}
                />
              )}
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                value={name}
                className={isWithError && !name ? "empty-field" : ""}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="about">
                Sobre <span>Máximo de 300 caracteres</span>
              </label>
              <textarea
                id="about"
                maxLength={300}
                value={about}
                className={isWithError && !about ? "empty-field" : ""}
                onChange={(event) => setAbout(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="images-container">
                {previewImages.map((image, index) => (
                  <div key={image}>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <FiX size={24} color="#FF669D" />
                    </button>
                    <img src={image} alt={name} />
                  </div>
                ))}

                <label
                  htmlFor="images[]"
                  className={
                    isWithError && images.length === 0
                      ? "new-image empty-field"
                      : "new-image"
                  }
                >
                  <FiPlus size={24} color="#15b6d6" />
                </label>
              </div>

              <input
                multiple
                onChange={handleSelectImages}
                type="file"
                id="images[]"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea
                id="instructions"
                value={instructions}
                className={isWithError && !instructions ? "empty-field" : ""}
                onChange={(event) => setInstructions(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input
                id="opening_hours"
                value={opening_hours}
                className={isWithError && !opening_hours ? "empty-field" : ""}
                onChange={(event) => setOpeninHours(event.target.value)}
              />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button
                  type="button"
                  className={open_on_weekends ? "active" : ""}
                  onClick={() => setOpenOnWeekends(true)}
                >
                  Sim
                </button>
                <button
                  type="button"
                  className={!open_on_weekends ? "active" : ""}
                  onClick={() => setOpenOnWeekends(false)}
                >
                  Não
                </button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}
