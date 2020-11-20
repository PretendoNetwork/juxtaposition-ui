const { Schema, model } = require('mongoose');

const  UserSchema = new Schema({
    pid: Number,
    created_at: String,
    user_id: String,
    birthday: Date,
    country: String,
    pfp_uri: String,
    mii: String,
    /**
     * Account Status
     * 0 - Fine
     * 1 - Limited from Posting
     * 2 - Temporary Ban
     * 3 - Forever Ban
     */
    account_status: {
        type: Number,
        default: 0
    },
    ban_lift_date: Date,
    official: {
        type: Boolean,
        default: false
    },
    favorite_communities: {
        type: [String],
        default: undefined
    },
    profile_comment: {
        type: String,
        default: undefined
    },
    /**
     * Game Skill Level
     * 1 - Beginner
     * 2 - Intermediate
     * 3 - Expert
     */
    game_skill: {
        type: Number,
        default: 0
    },
    /**
     * Profile Visibility settings
     * 1 - Everyone
     * 2 - Friends Only
     * 3 - Private
     */
    game_skill_visibility: {
        type: Number,
        default: 1
    },
    profile_comment_visibility: {
        type: Number,
        default: 1
    },
    birthday_visibility: {
        type: Number,
        default: 3
    },
    relationship_visibility: {
        type: Number,
        default: 2
    },
    profile_favorite_community_visibility: {
        type: Number,
        default: 1
    }

});

UserSchema.methods.getAccountStatus = async function() {
    return this.get('account_status');
};

UserSchema.methods.setAccountStatus = async function(accountStatus) {
    this.set('account_status', accountStatus);
    await this.save();
};
UserSchema.methods.getBanDate = async function() {
    return this.get('ban_lift_date');
};

UserSchema.methods.setBanData = async function(banDate) {
    this.set('ban_lift_date', banDate);
    await this.save();
};
UserSchema.methods.getProfileComment = async function() {
    return this.get('profile_comment');
};
UserSchema.methods.setProfileComment = async function(profileComment) {
    this.set('profile_comment', profileComment);
    await this.save();
};

UserSchema.methods.getGameSkill = async function() {
    return this.get('game_skill');
};

UserSchema.methods.setGameSkill = async function(gameSkill) {
    this.set('game_skill', gameSkill);
    await this.save();
};
UserSchema.methods.getGameSkillVisibility = async function() {
    return this.get('game_skill_visibility');
};

UserSchema.methods.setGameSkillVisibility = async function(gameSkillVisibility) {
    this.set('game_skill_visibility', gameSkillVisibility);
    await this.save();
};
UserSchema.methods.getProfileCommentVisibility = async function() {
    return this.get('profile_comment_visibility');
};

UserSchema.methods.setProfileCommentVisibility = async function(profileCommentVisibility) {
    this.set('profile_comment_visibility', profileCommentVisibility);
    await this.save();
};
UserSchema.methods.getBirthdayVisibility = async function() {
    return this.get('birthday_visibility');
};

UserSchema.methods.setBirthdayVisibility = async function(birthdayVisibility) {
    this.set('birthday_visibility', birthdayVisibility);
    await this.save();
};
UserSchema.methods.getRelationshipVisibility = async function() {
    return this.get('relationship_visibility');
};

UserSchema.methods.setRelationshipVisibility = async function(accountStatus) {
    this.set('relationship_visibility', accountStatus);
    await this.save();
};
UserSchema.methods.getFavoriteCommunityVisibility = async function() {
    return this.get('profile_favorite_community_visibility');
};

UserSchema.methods.setFavoriteCommunityVisibility = async function(favoriteCommunityVisibility) {
    this.set('profile_favorite_community_visibility', favoriteCommunityVisibility);
    await this.save();
};

const USER = model('USER', UserSchema);

module.exports = {
    UserSchema,
    USER
};