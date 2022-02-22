import { createApp } from 'https://cdnjs.cloudflare.com/ajax/libs/vue/3.2.29/vue.esm-browser.min.js';
import pagination from './components/pagination.js';

const { defineRule, Form, Field, ErrorMessage, configure } = VeeValidate;
const { required, email, min, max } = VeeValidateRules;
const { localize, loadLocaleFromURL } = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);

loadLocaleFromURL('./zh_TW.json');

configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'),
  validateOnInput: true, // 輸入字元立即進行驗證
});

const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const api_path = 'minhsin';


const app = Vue.createApp({
  components:{
    VForm: Form,
    VField:Field,
    ErrorMessage: ErrorMessage,
    pagination
  },
  data() {
    return {
      cartData: {
        carts: [],
      },
      products: [],
      productId: '',
      isLoadingItem: '',
      pagination:{},
      form: {
        user: {
          name: '',
          email: '',
          tel: '',
          address: '',
        },
        message: '',
      },
      message: '',
    };
  },

  methods: {
    getProducts( page = 1) {
      axios.get(`${apiUrl}/api/${api_path}/products/?page=${page}`)
      .then( res=> {
        this.products = res.data.products;
        this.pagination = res.data.pagination;
      })
      .catch((err)=> {
        alert(err.data.message);
      });
    },
    openProductModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    getCart() {
      axios.get(`${apiUrl}/api/${api_path}/cart`)
      .then((res) => {
        this.cartData = res.data.data;
      })
      .catch((err)=> {
        alert(err.data.message);
      });
    },
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${api_path}/cart`, { data })
      .then((res) => {
        this.getCart();
        this.$refs.productModal.closeModal();
        this.isLoadingItem = '';
      });
    },
    removeCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${api_path}/cart/${id}`)
      .then((res) => {
        this.getCart();
        this.isLoadingItem = '';
      });
    },
    removeAllCarts() {
      axios.delete(`${apiUrl}/api/${api_path}/carts`)
      .then((res) => {
        this.getCart();
      })
      .catch((err) => {
        console.log(err.response)
      });
    },
    updateCartItem(item) {
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios.put(`${apiUrl}/api/${api_path}/cart/${item.id}`, { data })
      .then((res) => {
        console.log(res);
        this.getCart();
        this.isLoadingItem = '';
      })
      .catch((err)=> {
        alert(err.data.message);
      });
    },
    isPhone (value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : '需要正確的電話號碼';
    },
    sendOrder() {
      const order = this.form;
      axios.post(`${apiUrl}/api/${api_path}/order`, { data: order })
      .then((res) => {
        this.$refs.form.resetForm();
        this.getCart();
      })
      .catch( (er)=> {
        alert(er.data.message);
      });
    },
  },
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

// $refs
app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    };
  },
  watch: {
    id() {
      this.getProduct();
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${apiUrl}/api/${api_path}/product/${this.id}`)
      .then((res) => {
        this.product = res.data.product;
      });
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty);
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');
