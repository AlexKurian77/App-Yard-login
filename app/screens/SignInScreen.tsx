import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";
import {
    GoogleSignin,
    isSuccessResponse,
    isErrorWithCode,
    statusCodes,
    GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import {
    auth,
    PhoneAuthProvider,
    GoogleAuthProvider,
    signInWithCredential,
    linkWithCredential,
} from "../../firebaseConfig";
import { PhoneAuthCredential } from "firebase/auth";

export default function SignInScreen() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const [verificationId, setVerificationId] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");

    const [googleCredential, setGoogleCredential] = useState(null);
    const [phoneCredential, setPhoneCredential] = useState<PhoneAuthCredential | null>(null);

    const [isGoogleDone, setIsGoogleDone] = useState(false);
    const [isPhoneDone, setIsPhoneDone] = useState(false);

    const recaptchaVerifier = useRef<FirebaseRecaptchaVerifierModal | null>(null);

    useEffect(() => {
        const finalizeSignIn = async () => {
            try {
                if (googleCredential && phoneCredential) {
                    setIsSubmitting(true);
                    const userCredential = await signInWithCredential(auth, phoneCredential);
                    console.log("Signed in with phone");
                    await linkWithCredential(userCredential.user, googleCredential);
                    console.log("Linked Google with Phone successfully");
                    alert("You're signed in with both Google and Phone!");
                }
            } catch (err) {
                console.error("Auto-linking failed:", err);
                setIsGoogleDone(false);
                setIsPhoneDone(false);
                setGoogleCredential(null);
                setPhoneCredential(null);
                setVerificationId("");
                setMessage("Auto-linking failed. Try again.");
            } finally {
                setIsSubmitting(false);
            }
        };

        if (isGoogleDone && isPhoneDone && !isSubmitting) {
            finalizeSignIn();
        }
    }, [isGoogleDone, isPhoneDone]);

    const handleGoogleSignIn = async () => {
        try {
            setIsSubmitting(true);
            await GoogleSignin.signOut();
            await GoogleSignin.hasPlayServices();
            const response = await GoogleSignin.signIn();

            if (isSuccessResponse(response)) {
                const { idToken } = response.data;
                const credential = GoogleAuthProvider.credential(idToken);
                setGoogleCredential(credential);
                setIsGoogleDone(true);
                setMessage("Google verified ✅");
            } else {
                console.error("Google Sign-In failed");
                setMessage("Google Sign-In failed");
            }
        } catch (error) {
            if (isErrorWithCode(error)) {
                switch (error.code) {
                    case statusCodes.SIGN_IN_CANCELLED:
                        console.error("User cancelled the sign-in flow");
                        break;
                    case statusCodes.IN_PROGRESS:
                        console.error("Sign-in is in progress");
                        break;
                    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
                        console.error("Play Services not available");
                        break;
                    default:
                        console.error("Google Sign-In error", error);
                }
            } else {
                console.error("Google Sign-In error", error);
            }
            setMessage("Google Sign-In Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const sendVerification = async () => {
        try {
            if (!phoneNumber) {
                setMessage("Type your number");
                return;
            }

            const phoneProvider = new PhoneAuthProvider(auth);
            const id = await phoneProvider.verifyPhoneNumber(
                "+91" + phoneNumber,
                recaptchaVerifier.current
            );
            setVerificationId(id);
            setMessage("OTP sent!");
        } catch (err) {
            console.error(err);
            setMessage("Failed to send OTP");
        }
    };

    const confirmCode = async () => {
        try {
            const credential = PhoneAuthProvider.credential(verificationId, code);
            setPhoneCredential(credential);
            setIsPhoneDone(true);
            setMessage("Phone verified ✅");
        } catch (err) {
            console.error(err);
            setMessage("Invalid OTP or something went wrong");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image
                    source={require("../../assets/images/circle.png")}
                    style={{ width: 380, height: 260, position: "absolute" }}
                />
                <Image
                    source={require("../../assets/images/logo.png")}
                    style={{ width: 150, height: 100 }}
                />
            </View>

            <Text style={styles.title}>Sign In</Text>

            {!isPhoneDone && !verificationId ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Mobile Number*</Text>
                    <View style={styles.phoneInputContainer}>
                        <Text style={styles.countryCode}>+91</Text>
                        <TextInput
                            placeholder="Enter Number"
                            onChangeText={setPhoneNumber}
                            keyboardType="phone-pad"
                            style={styles.phoneInput1}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.sendOtpButton}
                        onPress={sendVerification}
                    >
                        <Text style={styles.sendOtpButtonText}>Send OTP</Text>
                        <View style={styles.arrowView}>
                            <Image source={require("../../assets/images/arrow.png")}></Image>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : !isPhoneDone ? (
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Enter OTP*</Text>
                    <TextInput
                        placeholder="Enter OTP"
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        style={styles.phoneInput2}
                    />
                    <TouchableOpacity
                        style={styles.confirmOtpButton}
                        onPress={confirmCode}
                    >
                        <Text style={styles.confirmOtpButtonText}>Verify OTP</Text>
                        <View style={styles.arrowView}>
                            <Image source={require("../../assets/images/arrow.png")}></Image>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <Text style={styles.doneText}>✔️ Phone OTP Complete</Text>
            )}

            {!isGoogleDone && !isSubmitting ? (
                <GoogleSigninButton
                    onPress={handleGoogleSignIn}
                    size={GoogleSigninButton.Size.Standard}
                    color={GoogleSigninButton.Color.Dark}
                />
            ) : (
                <Text style={styles.doneText}>✔️ Google Sign-In Complete</Text>
            )}

            <FirebaseRecaptchaVerifierModal
                ref={recaptchaVerifier}
                firebaseConfig={auth.app.options}
            />

            {message ? (
                <Text style={{ color: "#fff", marginTop: 20 }}>{message}</Text>
            ) : null}
            {isSubmitting && <ActivityIndicator size="large" color="#4285F4" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1E1E2F",
        padding: 20,
    },
    logoContainer: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 25,
        borderColor: "#fff",
        width: "100%",
        height: 200,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
    },
    inputContainer: {
        width: "100%",
        marginBottom: 30,
    },
    label: {
        fontSize: 16,
        color: "#fff",
        marginBottom: 10,
    },
    phoneInputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#2E2E3A",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 12,
    },
    countryCode: {
        fontSize: 16,
        color: "#fff",
        marginRight: 10,
    },
    phoneInput1: {
        flex: 1,
        fontSize: 16,
        color: "#fff",
        padding: 10,
    },
    phoneInput2: {
        flex: 1,
        fontSize: 16,
        color: "#fff",
        borderWidth: 1,
        minHeight: 40,
        borderColor: "#fff",
        padding: 10,
    },
    sendOtpButton: {
        marginTop: 20,
        backgroundColor: "#FFF",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    sendOtpButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    arrowView:{
        position:"absolute",
        right:0,
        marginRight:10,
        padding:5
    },
    confirmOtpButton: {
        marginTop: 20,
        backgroundColor: "#fff",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    confirmOtpButtonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "bold",
    },
    googleButton: {
        backgroundColor: "#4285F4",
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 20,
    },
    googleButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    doneText: {
        fontSize: 16,
        color: "green",
        marginBottom: 20,
    },
});
