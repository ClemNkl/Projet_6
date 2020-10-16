const Sauce = require('../models/Sauce');
const fs = require('fs');

// Créer une sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce ajoutée !'}))
    .catch(error => res.status(400).json({ error }));
};

//Afficher une sauce
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

//Modifier une sauce
exports.modifySauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if (sauce.userId == req.body.userId) {
        const sauceObject = req.file ?
          {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
          } : { ...req.body };
        Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
          .catch(error => res.status(400).json({ error }));
    }})
    .catch(error => res.status(400).json({ error }));
};

//Supprimer une sauce
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      if (sauce.userId == req.body.userId) {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Sauce.deleteOne({ _id: req.params.id })
            .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
            .catch(error => res.status(400).json({ error }));
      });
    }})
    .catch(error => res.status(500).json({ error }));
};

//Afficher toutes les sauces
exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(400).json({ error }));
};

//Gestion des likes
exports.likeSauce = (req, res, next) => {
  const likeStatus = req.body.like;

  if (likeStatus == 1) {
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        if (!sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id }, {$push: { usersLiked: req.body.userId }, $inc: { likes: +1 },})
            .then(() => res.status(200).json({ message: 'Vous aimez cette sauce!' }))
            .catch((error) => res.status(400).json({ error }))
        }
      })
      .catch(error => res.status(400).json({ error }));
  }

  if (likeStatus == -1) {
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        if (!sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id }, {$push: { usersDisliked: req.body.userId }, $inc: { dislikes: +1 },})
            .then(() => res.status(200).json({ message: 'Vous n\'aimez pas cette sauce...' }))
            .catch((error) => res.status(400).json({ error }))
        }
      })
      .catch(error => res.status(400).json({ error }));
  }

  if (likeStatus == 0) {
    Sauce.findOne({_id: req.params.id})
      .then((sauce) => {
        if (sauce.usersLiked.includes(req.body.userId)) {
          Sauce.updateOne({_id: req.params.id}, {$pull: { usersLiked: req.body.userId }, $inc: {likes: -1}})
            .then(() => {res.status(200).json({ message: 'Votre vote a été retiré.'})})
            .catch(error => res.status(400).json({ error }))
        } else if (sauce.usersDisliked.includes(req.body.userId)) {
          Sauce.updateOne({_id: req.params.id}, {$pull: { usersDisliked: req.body.userId }, $inc: {dislikes: -1}})
            .then(() => {res.status(200).json({ message: 'Votre vote a été retiré.'})})
            .catch(error => res.status(400).json({ error }))
        }
      })
      .catch(error => res.status(400).json({ error }));
  }
};
