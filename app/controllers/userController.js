import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { Sport } from '../models/Sport.js';
import { Photo } from '../models/Photo.js';
import { Location } from '../models/Location.js';
import bcrypt from 'bcrypt';
const saltRounds = 10;

// Récupérer les informations de l'utilisateur et sa localisation
const userController = {
  async getProfil(req, res) {
    const userId = req.params.id;
    try {
      const user = await User.findOne({
        where: { id: userId },
      });
      const location = await Location.findOne({
        where: { id: user.dataValues.location_id },
      });

      // Récupérer les activités de l'utilisateur
      const activities = await Activity.findAll({
        where: { user_id: userId },
        include: [{ model: Sport }, { model: Location }],
      });

      // Créer une liste d'activités en format simplifié
      const activitiesList = await activities.map((activity) => {
        return {
          id: activity.id,
          title: activity.title,
          note: activity?.note,
          description: activity?.description,
          family_tag: activity?.family_tag,
          photo: activity?.photo,
          sportID: activity.Sport?.id,
          sportName: activity.Sport?.name,
          location_id: activity.Location?.id,
          locationName: activity.Location?.name,
          locationPostcode: activity.Location?.postcode,
          locationDepartment: activity.Location?.department,
        };
      });

      // Récupérer la photo de profil de l'utilisateur et l'ajouter aux données de l'utilisateur
      const userPhotoProfil = await Photo.findOne({
        where: { user_id: userId },
      });
      console.log(userPhotoProfil);
      if (userPhotoProfil) {
        user.dataValues.photo = userPhotoProfil.dataValues?.name;
      }

      // Ajouter les informations de localisation et les activités à l'objet utilisateur
      user.dataValues.locationName = location?.name;
      user.dataValues.locationPostcode = location?.postcode;
      user.dataValues.locationDepartment = location?.department;
      user.dataValues.activitiesList = activitiesList;
      //
      const profilPhoto = await Photo.findAll({
        where: { user_id: userId },
        attributes: ['name'],
      });

      if (profilPhoto) {
        user.photos = profilPhoto;
      }
      //
      // Supprimer le mot de passe de l'objet utilisateur avant de le renvoyer
      delete user.dataValues.password;
      res.status(200).json(user);
    } catch (err) {
      res.status(404).json({ message: err });
    }
  },

  async modifyProfil(req, res) {
    let jsonAsString;
    if (req.body?.jsonAsString) {
      jsonAsString = JSON.parse(req.body.jsonAsString);
    }

    const userId = req.params.id;
    let hashPassword;
    if (jsonAsString?.password) {
      hashPassword = await bcrypt.hash(jsonAsString.password, saltRounds);
    }

    try {
      await User.update(
        {
          firstname: jsonAsString?.firstname,
          lastname: jsonAsString?.lastname,
          email: jsonAsString?.email,
          login: jsonAsString?.login,
          age: jsonAsString?.age,
          bio: jsonAsString?.bio,
          location_id: jsonAsString?.location_id,
          password: jsonAsString?.password,
        },
        { where: { id: userId } },
      );
      const updateInfoProfil = await User.findOne({ where: { id: userId } });
      let photos = {};
      // Upload photo process
      // if (req?.files) {

      //   await Photo.create({
      //     name: req.file?.filename,
      //     user_id: userId,
      //   });
      // }
      if (req?.files) {
        // Récupération name photo en BDD
        const userHasPhoto = await Photo.findOne({ user_id: userId });
        if (userHasPhoto) {
          console.log(userHasPhoto);
          // Supression du fichier physique.
          // Supression de l'entrée du fichier en base de données.
          // if (dataToControl?.dataValues && req?.files != undefined) {
          // req?.files.forEach((file) =>
          //   unlink(`app/photos/${file.filename}`, (err) => {
          //     if (err) throw err;
          //     console.log('path/file.txt was deleted');
          //   }),
          // );
          // }
        }
        // Ajout du nom de la photo en BDD en lien avec le user_id
        for (let i = 0; i < req?.files.length; i++) {
          photos[i] = req.files[i].filename;
          await Photo.create({
            name: req.files[i].filename,
            user_id: userId,
          });
        }
      }
      delete updateInfoProfil.dataValues.password;
      res.status(200).json(updateInfoProfil);
    } catch (err) {
      // const error = err?.errors[0]?.message;
      // res.status(400).json(error);
      console.log(err);
    }
  },
  async getPhoto(req, res) {
    try {
      const fileName = req.params.name;
      const directoryPath = 'app/photos/';
      res.download(directoryPath + fileName, fileName, (err) => {
        if (err) {
          //console.log('Error downloading file:', err);
          res.status(500).json({ message: 'Could not download the file.' });
          return;
        }
        //console.log('File downloaded successfully.');
      });
    } catch (err) {
      //console.log('Error:', err);
      res.status(500).json({ message: 'An error occurred.' });
    }
  },
};

export { userController };
