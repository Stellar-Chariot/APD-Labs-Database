import type { AppState, AppAction } from "@/types/state"

// Sample reducer
export function samplesReducer(state: AppState["samples"], action: AppAction): AppState["samples"] {
  switch (action.type) {
    case "FETCH_SAMPLES_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "FETCH_SAMPLES_SUCCESS":
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null,
      }
    case "FETCH_SAMPLES_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case "ADD_SAMPLE":
      return {
        ...state,
        data: [...state.data, action.payload],
      }
    case "UPDATE_SAMPLE":
      return {
        ...state,
        data: state.data.map((sample) => (sample.id === action.payload.id ? action.payload : sample)),
      }
    case "DELETE_SAMPLE":
      return {
        ...state,
        data: state.data.filter((sample) => sample.id !== action.payload),
      }
    default:
      return state
  }
}

// Measurements reducer
export function measurementsReducer(state: AppState["measurements"], action: AppAction): AppState["measurements"] {
  switch (action.type) {
    case "FETCH_MEASUREMENTS_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      }
    case "FETCH_MEASUREMENTS_SUCCESS":
      return {
        ...state,
        data: action.payload,
        loading: false,
        error: null,
      }
    case "FETCH_MEASUREMENTS_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    case "ADD_MEASUREMENT":
      return {
        ...state,
        data: [...state.data, action.payload],
      }
    case "UPDATE_MEASUREMENT":
      return {
        ...state,
        data: state.data.map((measurement) => (measurement.id === action.payload.id ? action.payload : measurement)),
      }
    case "DELETE_MEASUREMENT":
      return {
        ...state,
        data: state.data.filter((measurement) => measurement.id !== action.payload),
      }
    case "SELECT_MEASUREMENT":
      return {
        ...state,
        selectedMeasurement: action.payload,
      }
    default:
      return state
  }
}

// UI reducer
export function uiReducer(state: AppState["ui"], action: AppAction): AppState["ui"] {
  switch (action.type) {
    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }
    case "SET_SIDEBAR":
      return {
        ...state,
        sidebarOpen: action.payload,
      }
    case "SET_THEME":
      return {
        ...state,
        theme: action.payload,
      }
    case "ADD_NOTIFICATION":
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: crypto.randomUUID(),
            ...action.payload,
          },
        ],
      }
    case "REMOVE_NOTIFICATION":
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
      }
    default:
      return state
  }
}

// Root reducer that combines all reducers
export function rootReducer(state: AppState, action: AppAction): AppState {
  return {
    samples: samplesReducer(state.samples, action),
    measurements: measurementsReducer(state.measurements, action),
    ui: uiReducer(state.ui, action),
  }
}

