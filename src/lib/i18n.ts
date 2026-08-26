import { useStore } from '../store';

export type Lang = 'ru' | 'en';

const ru = {
    sectionFile: 'Файл',
    sectionLine: 'Линия',
    sectionMap: 'Подложка',
    sectionPoints: 'Точки (wpt)',
    sectionExport: 'Экспорт',
    sectionFavorites: 'Избранное',
    sectionSettings: 'Настройки',
    sectionFeedback: 'Обратная связь',

    chooseFile: 'Выбрать GPX-файл',
    viewExample: 'Посмотреть пример',
    dropFileHere: 'Отпустите GPX-файл',
    noTrackHint: 'Загрузите GPX-файл, перетащите его на карту или откройте пример',
    fileInfo: '{name} — {points} точек · {km} км',
    deleteFile: 'Удалить файл',
    deleteFileTitle: 'Удалить файл',
    deleteFileText: 'Убрать загруженный трек с карты? Настройки и избранное сохранятся.',
    sampleLoadError: 'Не удалось загрузить пример',

    gradient: 'Градиент',
    color: 'Цвет',
    colorFrom: 'Цвет «от»',
    colorTo: 'Цвет «до»',
    thickness: 'Толщина: {px}px',
    casing: 'Обводка',
    casingColor: 'Цвет обводки',
    casingWidth: 'Ширина: {px}px',

    gradientType: 'Тип градиента',
    gradientByLength: 'По длине',
    gradientByElevation: 'По высоте',
    colorFromLow: 'Цвет внизу',
    colorToHigh: 'Цвет вверху',
    presetDefault: 'По умолчанию',
    noElevationData: 'В этом треке нет данных о высоте',

    show: 'Показывать',
    opacity: 'Прозрачность: {pct}%',
    filterNone: 'Без фильтра',
    filterGrayscale: 'Чёрно-белый',
    filterSepia: 'Сепия',
    filterInvert: 'Инверсия',

    radius: 'Радиус: {px}px',
    noWpt: 'В этом треке нет точек wpt',

    exportButton: 'Сохранить изображение',
    exportScale: 'Масштаб картинки',
    exportHint: 'Экспортируется текущий вид карты. С выключенной подложкой получится PNG с прозрачным фоном.',
    exportReady: 'Изображение готово',
    exportPreviewAlt: 'Превью трека',
    exportResolution: 'Разрешение {w}×{h}px · PNG',
    exportTransparent: ' с прозрачным фоном',
    download: 'Скачать',
    exportErrorTitle: 'Ошибка экспорта',
    exportError:
        'Не удалось экспортировать: {error}\n\nЧастая причина — тайлы подложки не отдают CORS-заголовок. Попробуйте другого провайдера или отключите подложку.',

    favoritesHint: 'Сохраняйте пресеты стиля и применяйте их в один клик',
    saveCurrentSettings: 'Сохранить текущие настройки',
    alreadySavedTitle: 'Текущие настройки уже есть в избранном',
    presetLimitTitle: 'Лимит бесплатного плана — 3 пресета. Премиум можно активировать в «Аккаунте»',
    savePresetTitle: 'Сохранить в избранное',
    presetNamePlaceholder: 'Название пресета',
    presetNameEmpty: 'Введите название пресета',
    presetNameReserved: 'Это название зарезервировано',
    presetNameDuplicate: 'Пресет с таким названием уже есть',
    applyPresetTitle: 'Применить пресет',
    deletePresetTitle: 'Удалить из избранного',
    deletePresetText: 'Удалить пресет «{name}»? Это действие нельзя отменить.',
    savePreset: 'Сохранить',
    presetDefaultName: 'Пресет {n}',

    premiumTitle: 'Премиум-доступ',
    premiumText:
        'На бесплатном плане доступно не больше {limit} пресетов. Оформите премиум, чтобы сохранять неограниченное количество пресетов.',
    later: 'Позже',
    activatePremium: 'Активировать премиум (демо)',
    premiumActivated: 'Премиум активирован',

    language: 'Язык интерфейса',
    theme: 'Тема интерфейса',
    themeDark: 'Тёмная',
    themeLight: 'Светлая',

    accountNamePlaceholder: 'Ваше имя',
    subscription: 'Подписка',
    statusFree: 'Free',
    statusPremium: 'Премиум',

    shareApp: 'Поделиться ссылкой',
    linkCopied: 'Ссылка скопирована',
    copied: 'Скопировано',
    contactDev: 'Связаться с разработчиком',
    feedbackTitle: 'Сообщение разработчику',
    yourEmail: 'Ваш e-mail (необязательно)',
    yourMessage: 'Сообщение',
    send: 'Отправить',
    messageSent: 'Сообщение отправлено',
    enterMessage: 'Введите сообщение',

    resetButton: 'Сбросить к начальным значениям',
    resetTitle: 'Сбросить настройки',
    resetText:
        'Все настройки линии, подложки и точек вернутся к начальным значениям. Загруженный трек и избранное останутся без изменений.',
    reset: 'Сбросить',
    resetDefaultTitle: 'Настройки уже соответствуют начальным значениям',

    cancel: 'Отмена',
    delete: 'Удалить',
    ok: 'Ок',

    sheetEmpty: 'GPX-файл не загружен',
    trackStats: '{points} точек · {km} км',
    ariaShowPanel: 'Развернуть панель',
    ariaHidePanel: 'Свернуть панель',

    zoomIn: 'Приблизить',
    zoomOut: 'Отдалить',
    centerTrack: 'Центрировать трек',
};

export type TKey = keyof typeof ru;

const en: Record<TKey, string> = {
    sectionFile: 'File',
    sectionLine: 'Line',
    sectionMap: 'Basemap',
    sectionPoints: 'Waypoints (wpt)',
    sectionExport: 'Export',
    sectionFavorites: 'Favorites',
    sectionSettings: 'Settings',
    sectionFeedback: 'Feedback',

    chooseFile: 'Choose GPX file',
    viewExample: 'View example',
    dropFileHere: 'Drop GPX file here',
    noTrackHint: 'Upload a GPX file, drag it onto the map, or open the example',
    fileInfo: '{name} — {points} points · {km} km',
    deleteFile: 'Delete file',
    deleteFileTitle: 'Delete file',
    deleteFileText: 'Remove the loaded track from the map? Settings and favorites will be kept.',
    sampleLoadError: 'Could not load the example',

    gradient: 'Gradient',
    color: 'Color',
    colorFrom: 'Color from',
    colorTo: 'Color to',
    thickness: 'Width: {px}px',
    casing: 'Casing',
    casingColor: 'Casing color',
    casingWidth: 'Width: {px}px',

    gradientType: 'Gradient type',
    gradientByLength: 'By distance',
    gradientByElevation: 'By elevation',
    colorFromLow: 'Color (low)',
    colorToHigh: 'Color (high)',
    presetDefault: 'Default',

    noElevationData: 'This track has no elevation data',

    show: 'Show',
    opacity: 'Opacity: {pct}%',
    filterNone: 'No filter',
    filterGrayscale: 'Black & white',
    filterSepia: 'Sepia',
    filterInvert: 'Invert',

    radius: 'Radius: {px}px',
    noWpt: 'This track has no waypoints',

    exportButton: 'Save image',
    exportScale: 'Image scale',
    exportHint: 'The current map view will be exported. With the basemap off you get a transparent PNG.',
    exportReady: 'Image is ready',
    exportPreviewAlt: 'Track preview',
    exportResolution: 'Resolution {w}×{h}px · PNG',
    exportTransparent: ' with transparent background',
    download: 'Download',
    exportErrorTitle: 'Export failed',
    exportError:
        'Export failed: {error}\n\nCommon reason — basemap tiles do not send CORS headers. Try another provider or turn off the basemap.',

    favoritesHint: 'Save style presets and apply them in one click',
    saveCurrentSettings: 'Save current settings',
    alreadySavedTitle: 'Current settings are already in favorites',
    presetLimitTitle: 'Free plan limit is 3 presets. Premium can be activated in Account',
    savePresetTitle: 'Save to favorites',
    presetNamePlaceholder: 'Preset name',
    presetNameEmpty: 'Enter a preset name',
    presetNameReserved: 'This name is reserved',
    presetNameDuplicate: 'A preset with this name already exists',
    applyPresetTitle: 'Apply preset',
    deletePresetTitle: 'Remove from favorites',
    deletePresetText: 'Delete preset “{name}”? This cannot be undone.',
    savePreset: 'Save',
    presetDefaultName: 'Preset {n}',

    premiumTitle: 'Premium access',
    premiumText:
        'The free plan allows up to {limit} presets. Upgrade to premium to save unlimited presets.',
    later: 'Later',
    activatePremium: 'Activate premium (demo)',
    premiumActivated: 'Premium activated',

    language: 'Language',
    theme: 'Theme',
    themeDark: 'Dark',
    themeLight: 'Light',

    accountNamePlaceholder: 'Your name',
    subscription: 'Subscription',
    statusFree: 'Free',
    statusPremium: 'Premium',

    shareApp: 'Share link',
    linkCopied: 'Link copied',
    copied: 'Copied',
    contactDev: 'Contact developer',
    feedbackTitle: 'Message the developer',
    yourEmail: 'Your e-mail (optional)',
    yourMessage: 'Message',
    send: 'Send',
    messageSent: 'Message sent',
    enterMessage: 'Please enter a message',

    resetButton: 'Reset to defaults',
    resetTitle: 'Reset settings',
    resetText:
        'All line, basemap and point settings will be reset. The loaded track and favorites will stay untouched.',
    reset: 'Reset',
    resetDefaultTitle: 'Settings are already at defaults',

    cancel: 'Cancel',
    delete: 'Delete',
    ok: 'OK',

    sheetEmpty: 'No GPX file loaded',
    trackStats: '{points} points · {km} km',
    ariaShowPanel: 'Expand panel',
    ariaHidePanel: 'Collapse panel',

    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    centerTrack: 'Center track',
};

const STRINGS: Record<Lang, Record<TKey, string>> = { ru, en };

export function useT() {
    const lang = useStore((s) => s.lang);
    return (key: TKey, params?: Record<string, string | number>) => {
        let text = STRINGS[lang][key];
        if (params) {
            for (const [k, v] of Object.entries(params)) {
                text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
            }
        }
        return text;
    };
}
