class PWA_SettingsGroup {
    constructor(settings, sectionName, settingsList) {

        this.sectionName = sectionName;

        this.section = settings._getSection(sectionName);

        let ar = [...arguments];
        ar.shift();
        ar.shift();

        ar.forEach(i => {
            if (!i.name || !i.title || !i.type)
                throw TypeError("Setting needs at least id, type and title properties");
        })

        this.settings = ar;

    }
}

export default PWA_SettingsGroup;