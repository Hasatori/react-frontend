import {User} from "../../components/App";
import {Action, ActionCreator, AnyAction, Dispatch} from "redux";
import {ThunkAction} from "redux-thunk";
import {LoginRequest, TwoFactorLoginRequest} from "../../components/user/login/Login";
import {AccountActivationRequest} from "../../util/APIUtils";
import {
    doneActionCreator,
    failureActionCreator,
    GeneralActionTypes, infoActionCreator,
    inProgressActionCreator,
    successActionCreator
} from "./GeneralActionTypes";
import {SignUpRequest} from "../../components/user/signup/Signup";
import {ResetPasswordRequest} from "../../components/user/forgottenpassword/PasswordReset";
import {ChangePasswordRequest} from "../../components/user/account/ChangePassword";
import  {AxiosResponse} from "axios";
import API from "../../util/APIUtils";
import i18next from "i18next";

import {VerifyTwoFactor} from "../../components/user/account/TwoFactorSetup";

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGIN_TWO_FACTOR = 'LOGIN_TWO_FACTOR';
export const ADD_USER = 'ADD_USER';
export const UPDATE_USER = 'UPDATE_USER';
export const LOGOUT_USER = 'LOGOUT_USER';
export const TOKEN_REFRESHED = 'TOKEN_REFRESHED';
export const TWO_FACTOR_DISABLED = 'TWO_FACTOR_DISABLED';
export const TWO_FACTOR_ENABLED = 'TWO_FACTOR_ENABLED';
export const EMPTY_BACKUP_CODES = 'EMPTY_BACKUP_CODES';

export interface LoginSuccessAction extends Action {
    readonly  type: typeof LOGIN_SUCCESS,
    readonly accessToken: string;
}

export interface AddUserAction extends Action {
    readonly  type: typeof ADD_USER,
    readonly  user: User,
}

export interface UpdateUserAction extends Action {
    readonly type: typeof UPDATE_USER,
    newUser: User,
}

export interface LogoutUserAction extends Action {
    readonly type: typeof LOGOUT_USER
}

export interface LoginTwoFactorAction extends Action {
    readonly type: typeof LOGIN_TWO_FACTOR
}

export interface LoginFailureAction extends Action {
    readonly type: typeof LOGIN_FAILURE
}

export interface UpdateUserAction extends Action {
    readonly  type: typeof UPDATE_USER,
    readonly payload: User,
}

export interface UserLoggedInResponse {
    twoFactorRequired: boolean,
    accessToken: string
}

export interface TokenRefreshedAction extends Action {
    readonly  type: typeof TOKEN_REFRESHED
    accessToken: string,
}

export interface TwoFactorDisabled extends Action {
    readonly  type: typeof TWO_FACTOR_DISABLED
}

export interface TwoFactorEnabled extends Action {
    readonly  type: typeof TWO_FACTOR_ENABLED
    backupCodes: string[]
}

export interface EmptyBackupCodes extends Action {
    readonly  type: typeof EMPTY_BACKUP_CODES
}

export const loginActionCreator: ActionCreator<ThunkAction<void, void, LoginRequest, LoginSuccessAction>> = (loginRequest: LoginRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(""));
        API({
            url: "auth/login",
            method: 'POST',
            data: JSON.stringify(loginRequest)
        }).then((response: AxiosResponse<UserLoggedInResponse>) => {
            if (response.data.twoFactorRequired) {
                dispatch({type: LOGIN_TWO_FACTOR})
            } else {
                dispatch({type: LOGIN_SUCCESS, accessToken: response.data.accessToken})
            }
            dispatch(doneActionCreator());
        }).catch((error) => {

            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
            dispatch({type: LOGIN_FAILURE});
        });
    };
};

export const refreshTokenActionCreator: ActionCreator<ThunkAction<void, void, void, AnyAction>> = () => {
    return async (dispatch: Dispatch) => {
        API({
            url: "auth/refresh-token",
            method: 'POST'
        }).then((response) => {
            dispatch({type: TOKEN_REFRESHED, accessToken: response.data.accessToken})
        }).catch((error)=>{});
    };
};
export const loginTwoFactorActionCreator: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, LoginSuccessAction>> = (loginRequest: TwoFactorLoginRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(""));
        API({
            url: "auth/login/verify",
            method: 'POST',
            data: JSON.stringify(loginRequest)
        }).then(response => {
            dispatch({type: LOGIN_SUCCESS, accessToken: response.data.accessToken})
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};

export const loginRecoveryCodeActionCreator: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, LoginSuccessAction>> = (loginRequest: TwoFactorLoginRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(""));
        API({
            url: "auth/login/recovery-code",
            method: 'POST',
            data: JSON.stringify(loginRequest)
        }).then(response => {
            dispatch({type: LOGIN_SUCCESS, accessToken: response.data.accessToken})
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};


export const logoutActionCreator: ActionCreator<ThunkAction<void, void, void, LoginSuccessAction>> = () => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(""));
        API({
            url: "logout",
            method: 'POST'
        }).then(response => {
            dispatch(doneActionCreator());
            dispatch({type: LOGOUT_USER});
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    }
};

export const loadCurrentlyLoggedInUser: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, LoginSuccessAction>> = () => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "user/me",
            method: 'GET'
        }).then(response => {
            dispatch(doneActionCreator());
            dispatch({type: ADD_USER, user: response.data})
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    }
};

export const activateAccount: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, GeneralActionTypes>> = (accountActivationRequest: AccountActivationRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "auth/activateAccount",
            method: 'POST',
            data: JSON.stringify(accountActivationRequest)
        }).then(response => {
            dispatch(successActionCreator(response.data.message));
            dispatch(doneActionCreator());
        }).catch(error => {

                dispatch(doneActionCreator());
                dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
            }
        );
    };
};
export const confirmEmailChange: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, GeneralActionTypes>> = (accountActivationRequest: AccountActivationRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "auth/confirm-email-change",
            method: 'POST',
            data: JSON.stringify(accountActivationRequest)
        }).then(response => {
            dispatch(successActionCreator(response.data.message));
            dispatch(doneActionCreator());
        }).catch(error => {

                dispatch(doneActionCreator());
                dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
            }
        );
    };
};

export const signUp: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, GeneralActionTypes>> = (signupRequest: SignUpRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "auth/signup",
            method: 'POST',
            data: JSON.stringify(signupRequest)
        }).then(response => {
            dispatch(successActionCreator(response.data.message));
            dispatch(doneActionCreator());
        }).catch(error => {
                dispatch(doneActionCreator());
                dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
            }
        );
    };
};

export const forgottenPasswordRequest: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, GeneralActionTypes>> = (email: string) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "auth/forgottenPassword",
            method: 'POST',
            data: JSON.stringify({email: email})
        }).then(response => {
            dispatch(doneActionCreator());
            dispatch(successActionCreator(response.data.message));
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};

export const resetPassword: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, GeneralActionTypes>> = (resetPasswordRequest: ResetPasswordRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "auth/passwordReset",
            method: 'POST',
            data: JSON.stringify(resetPasswordRequest)
        }).then(response => {
            dispatch(doneActionCreator());
            dispatch(successActionCreator(response.data.message));
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};
export const changePassword: ActionCreator<ThunkAction<void, void, TwoFactorLoginRequest, GeneralActionTypes>> = (changePasswordRequest: ChangePasswordRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "changePassword",
            method: 'POST',
            data: JSON.stringify(changePasswordRequest)
        }).then(response => {
            dispatch(successActionCreator(response.data.message));
            dispatch({type: TOKEN_REFRESHED, accessToken: response.data.accessToken})
            dispatch(doneActionCreator());
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};
export const cancelAccount: ActionCreator<ThunkAction<void, void, LoginRequest, GeneralActionTypes>> = (loginRequest: LoginRequest) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "cancel-account",
            method: 'POST'
        }).then(response => {
            dispatch(successActionCreator(response.data.message));
            dispatch({type: LOGOUT_USER});
            dispatch(doneActionCreator());
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};

export const updateProfile: ActionCreator<ThunkAction<void, void, User, GeneralActionTypes>> = (newUser: User) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "update-profile",
            method: 'PUT',
            data: JSON.stringify(newUser)
        }).then(response => {
            dispatch(doneActionCreator());
            dispatch({type: UPDATE_USER, newUser: newUser})
            dispatch(successActionCreator(i18next.t('ns1:profileUpdated')));
            dispatch(infoActionCreator(i18next.t('ns1:profileUpdateEmailActivation')))
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};
export const enableTwoFactor: ActionCreator<ThunkAction<void, void, VerifyTwoFactor, GeneralActionTypes>> = (verifyTwoFactor: VerifyTwoFactor) => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "verifyTwoFactor",
            method: 'POST',
            data: JSON.stringify(verifyTwoFactor)
        }).then(response => {
            dispatch({type: TWO_FACTOR_ENABLED, backupCodes: response.data.verificationCodes});
            dispatch(successActionCreator(response.data.message));
            dispatch(doneActionCreator());
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};

export const disableTwoFactor: ActionCreator<ThunkAction<void, void, void, GeneralActionTypes>> = () => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "disable-two-factor",
            method: 'POST'
        }).then(response => {
            dispatch({type: TWO_FACTOR_DISABLED});
            dispatch(successActionCreator(response.data.message));
            dispatch(doneActionCreator());
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));
        });
    };
};
export const getNewBackupCodes: ActionCreator<ThunkAction<void, void, void, GeneralActionTypes>> = () => {
    return async (dispatch: Dispatch) => {
        dispatch(inProgressActionCreator(''));
        API({
            url: "getNewBackupCodes",
            method: 'POST',
        }).then(response => {
            dispatch({type: TWO_FACTOR_ENABLED, backupCodes: response.data.verificationCodes});
            dispatch(doneActionCreator());
        }).catch(error => {
            dispatch(doneActionCreator());
            dispatch(failureActionCreator((error.response && error.response.data && error.response.data.message) || i18next.t('ns1:defaultErrorMessage')));

        });
    };
};

export type UserActionTypes =
    LoginSuccessAction
    | LoginFailureAction
    | LogoutUserAction
    | LoginTwoFactorAction
    | UpdateUserAction
    | AddUserAction
    | TokenRefreshedAction
    | TwoFactorEnabled
    | TwoFactorDisabled
    | EmptyBackupCodes
