import { User } from '../models/User.js';
import { Activity } from '../models/Activity.js';
import { unlink } from 'node:fs';
import { Photo } from '../models/Photo.js';

export const controlUnique = {
  async uniqueUser(req, res, next) {
    const { login, password } = req.body;

    if (login === undefined || password === undefined) {
      return res.status(400).json({ Error: 'Formulaire non complet' });
    }
    const dataToControl = await User.findOne({ where: { login: login } });

    if (dataToControl?.dataValues) {
      return res.status(400).json({ Error: 'Utilisateur existe déjà' });
    }
    next();
  },
  async uniqueProfil(req, res, next) {
    try {
      const userId = req.params.id;
      let jsonAsString;
      if (req.body?.jsonAsString) {
        jsonAsString = JSON.parse(req.body?.jsonAsString);
      }
      // controle de l'unicité login et email en BDD.
      if (jsonAsString?.login) {
        const loginToControl = await User.findOne({
          where: { login: jsonAsString?.login },
        });
        if (loginToControl && loginToControl.id != userId) {
          return res.status(400).json({ Error: 'Ce login existe déjà' });
        }
      }
      if (jsonAsString?.email) {
        const emailToControl = await User.findOne({
          where: { email: jsonAsString?.email },
        });
        if (emailToControl && emailToControl.id != userId) {
          return res.status(400).json({ Error: 'Cet Email existe déjà' });
        }
      }

      if (req?.files?.length > 0) {
        const userPhotoProfil = await Photo.findOne({
          where: { user_id: userId },
          attributes: ['name'],
        });
        // Suppression du fichier sur le serveur
        if (userPhotoProfil) {
          unlink(`app/photos/${userPhotoProfil?.name}`, (err) => {
            if (err) throw err;
            console.log('fichier supprimé du serveur');
          });
          await Photo.destroy({ where: { user_id: userId } });
        }
      }
      next();
    } catch (err) {
      res.status(500).json(err);
      console.log(err);
    }
  },
  async loginNotEmpty(req, res, next) {
    const { login, password } = req.body;

    if (login === undefined || password === undefined) {
      return res.status(400).json({ Error: 'Formulaire non complet' });
    }
    next();
  },
  async uniqueActivity(req, res, next) {
    let jsonAsString;
    if (req.body?.jsonAsString) {
      jsonAsString = JSON.parse(req.body?.jsonAsString);
    }

    if (
      jsonAsString?.title === undefined ||
      jsonAsString?.sport_id === undefined ||
      jsonAsString?.user_id === undefined
    ) {
      if (req?.file?.filename) console.log('ICI : ');
      unlink(`app/photos/${req?.file?.filename}`, (err) => {
        if (err) throw err;
        console.log('path/file.txt was deleted');
      });
      return res.status(400).json({ Error: 'Formulaire non complet' });
    }

    const dataToControl = await Activity.findOne({
      where: { title: jsonAsString.title },
    });
    if (dataToControl?.dataValues && req?.files != undefined) {
      req?.files.forEach((file) =>
        unlink(`app/photos/${file.filename}`, (err) => {
          if (err) throw err;
          console.log('path/file.txt was deleted');
        }),
      );
    }
    if (dataToControl?.dataValues) {
      return res.status(400).json({ Error: "Nom d'activité déjà existant" });
    }

    next();
  },
};
