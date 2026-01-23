import { createApp } from 'vue'
import App from './App.vue'
import router from './routes'
import pinia from './stores'
import { setupPermissionDirective } from '@paigram/shared-components'

// 导入样式
import './style.css'
import '@arco-design/web-vue/es/message/style/index.css'
import '@arco-design/web-vue/es/notification/style/index.css'

const app = createApp(App)

// 注册路由
app.use(router)

// 注册状态管理
app.use(pinia)

// 注册权限指令
setupPermissionDirective(app)

app.mount('#app')