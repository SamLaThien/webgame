import axios from "axios";

const submitUrl = "https://www3.cbox.ws/box/?sec=submit&boxid=3539544&boxtag=KPxXBl&_v=1063";
const baseFormData = {
    aj: 1063,
    lp: 199,
    pst: "1",
    fp: 0,
    lid: 59824,
    nme: "Tu Chân Giới",
    key: "e797692bd37c84a82bc36c182c882bad",
};

export const chat = message => sendMessage(message);
export const pmCbox = (cbox_userid, message) => sendMessage(`//pm ${cbox_userid} ${message}`);

export const sendMessage = message => {
    const formData = new FormData();
    Object.keys(baseFormData).forEach(key => {
        formData.append(key, baseFormData[key]);
    });
    formData.append('pst', message);

    axios.post(submitUrl, formData)
        .then(() => {
            console.log("Message sent successfully.");
        })
        .catch(error => {
            console.error("Error sending message:", error);
        });
};
