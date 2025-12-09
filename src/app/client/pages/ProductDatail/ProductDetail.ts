import { Component, OnInit, signal, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ProductDetailService } from '../../../services/ProductDetail.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { ProductDetailDTO } from '../../../interfaces/ProductDetail.interface';
import { switchMap } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './ProductDetail.html',
  styleUrls: ['./ProductDetail.css']
})

export class ProductDetailComponent implements OnInit {
  product = signal<ProductDetailDTO | null>(null);
  isLoading = signal(true);
  productId = signal<number | null>(null);
  cantidad = signal(1);
  selectedIndex = signal(0);
  galleryImages = signal<string[]>([
    'assets/img/no-image.jpg',
    'assets/img/no-image.jpg',
    'assets/img/no-image.jpg'
  ]);
  selectedImage = signal<string>('assets/img/no-image.jpg');

  @ViewChild('mainImage', { static: false }) mainImage!: ElementRef<HTMLImageElement>;
  @ViewChild('lens', { static: false }) lens!: ElementRef<HTMLDivElement>;
  @ViewChild('result', { static: false }) result!: ElementRef<HTMLDivElement>;

  showLightbox = signal(false);
  private touchStartX = 0;

  constructor(
    private route: ActivatedRoute,
    private detailService: ProductDetailService,
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private snack: MatSnackBar,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private initializeCartId(): void {
    if (isPlatformBrowser(this.platformId) && !this.cartService.currentCartId()) {
      const storedId = localStorage.getItem('venta_id');
      if (storedId) {
        this.cartService.currentCartId.set(Number(storedId));
      }
    }
  }

  ngOnInit(): void {
    this.initializeCartId();

    this.route.paramMap
      .pipe(
        switchMap(params => {
          const id = Number(params.get('id'));
          this.productId.set(id);
          return id ? this.detailService.getProductDetailsById(id) : EMPTY;
        })
      )
      .subscribe({
        next: (data) => {
          this.product.set(data);

          const nombre = data.fldNombre || '';
          const galleryMap: Record<string, string[]> = {
            'Interruptores táctiles fijos de 6 x 6': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAz0wOnMLlTo5vMH3w5SfYAVvqQ9qsw9s2Jx9emgthCkE?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBbQSH_TwKmQIsq8NXcfdFzAZ7KwnFx7E7iZcfFpgEfNQI?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAEET98A6enRbJFPowWfAx9AUBkvdAca0OA9CXeih36scU?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAz0wOnMLlTo5vMH3w5SfYAVvqQ9qsw9s2Jx9emgthCkE?download=1'
            ],
            'Portatil': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBqT3-360BGiJgSjK_52n0B2g92bO_3f2L2D5k5r2T8G7A?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB32k397N5C4w5q8w2F1oPBg8j9k1b2G5O1s7P0r1M4O2E?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBz2j91f9RKiB9d9s8i5d2A8q2P6B8d7f9R0i2O8x1Y4U8?download=1'
            ],
            'Probador inteligente de dispositivos montaje superficial': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAsb6cBGEFVQbCUzlev9iamAfvx9SO1PVjP9pD18Ph4rD0?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDmi0VSC7TxQYuxW7OV7wXAAVCH_FptX9fO-MKlGIJkSno?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD_TQn4ymKfSrpJ88qajFToAbJRzGfVZo9RuDvrtqMPWHo?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBoKkxFCYxYT5tX6b9GtSfrAUyF5Bj-kTchtEBIiruQym4?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAOysE5qX3FRqhbsi0OpQOfARhY74coplbQIBKuIPMNGX4?download=1'
            ],
            'Fluido de succión': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBY3o1P7d9fA3c7s4e0o2L5h8J2u6t0y1R3v5M7n6D4P8K?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB9k7S3n1Y5b7c0z6d8o3E4i9F7g5j0p2K4m1L6r8T9A0V?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD6m1J4l9X0c5z2d7w9r4Q8e2R6u1T3a5S7v0O9p4N1Y6Z?download=1'
            ],
            'Comprobador de transistores LCR-P1': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBo8nLg_ZAsSo4QTvyRXkQgAYeVfDpy_9y-R5w35cMoNSE?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAUC74qJuweTL4bAfFWIUMkAXgHWz0oHPoq2N2IXkXxPGo?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCsNYGWBH6DS4glr_09xYShAZw5vppk73UBXEsf2TMU9jM?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDiElHVGFaQQ6nWuknA0kC6Ac16y1KGkQwNOaDPpUcsOJs?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDcGPzFzzSlQ6knEoFM5G6bAbUBT6bpQRN0J70v4vgKvN4?download=1'
            ],
            'Pluma de succión al vacío duradera': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD154bnSJgGQ7yvlqS5HRQuARZ5r9_mlURtyg_gb8odJbs?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBnhMoB9T3GRY6DTuUaHp6tAbjo5X8YKfX52NroRdEF7g4?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBr2GkFxfHARaLoyV4qiYtZAS6OsXXapaE9XTGz2Xa-C18?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDw308-rXamQqZ_qYS-lSwaAagI-kQHfjNVJd13hR4lQkk?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDBFfkmnh7ISaOb4YrFgn1sAbnNSdPt2aRUT4B9R9-WPkk?download=1',
            ],
            'Cargador avanzado de baterías individuales con pilas recargables': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQClKSpfJSeXSpPpYl37S3LTAaTRhcasnsuIUmG5Ku-HTkY?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCmQClqZvIYTI7JHoWekFB3AYQJsV5gP-_-pLR8AZ5bdjg?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA3woXs_CiVT6gXxtkUdlJHAW-yH0KocDS-QxutvpOx7dc?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBUEj2J09MvR4y5YZCAR8wUAfBQNTjcAmxAknbglp9ak7c?download=1',
            ],
            'Lindo Robot Mascota para Niños y Adultos': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDzZVfXAppuRq8X8LzT1avVAQ2cR_ZPK90OqqvXYPsaQDE?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAXGlHsWaR-QINOqyL1o-PMARYUkiBmrelm2ZiWFkRwGJU?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAJoJ07bae9SbpDoutjkIL9Ac1M7ou_zyj4y96TVQqRTIc?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD2-C13Fs5xRYJadKmKUgraASz0I2fXHJb7Wwl27uqIT6w?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC7-e35RSPcSJI1Loy2LRnsAREPOEjCAi8FKaHrP2LEWPY?download=1'
            ],
            'Kit Robótico de Coche V4.0 Arduino': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBY4p_9BLfRR4-uBdVULZRbAYdz0V8Tj7VyYHkEIVK49jw?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDzBAdiLeGzSJLqsOYWgIiCAYYMt3EQfQWd6isdXOgn1nc?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDJXtwWV_dCQKb9C4hruo-3AQUh013VmTVwKhMBCpxLMfc?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDnjfrvp2YWSbioBYrKhrfSAXdUISo44i5SYlL8A0xBJR8?download=1'

            ],
            'Kit Básico de Componentes Electrónicos Completo': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA9oRc1rvINSqdxg9v0GomdAbjVIRsjnEgH3-8_FTTV_GQ?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAoAyg9pRXfRY8WO--AEcriAXRXDejxKvkdNWsJCKwiQ88?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCiY8Ct1_diT7yrljGNZlEzAaxVZ8ejxfOwenhKhdxWj6E?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQArXxw0yjjZQbtDGDip-Pe-AXeB4QHdsdYib3vHf04CAtE?download=1'

            ],
            'Sensor Ultrasonico HC-SR04 Compatible con Arduino': [
             'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC9fmT9ZR7UQLL9R-3iWBbQAQ-FLg2SiLl1g1uV15Z7-_8?download=1',
             'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDvajHrXl5XTZdm_Dw67T9XAVM2j8SquctWYFjNx7Vrky0?download=1',
             'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCiPMtmtuAxSpPyYLhJaWp7AYgVgKTGW9QxdgNyZx0kQug?download=1',
             'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDyo2VD-SH8Rry_UAZgc95zAbeTDCCpay9gCSo9lQsve18?download=1'
            ],
            'Sensor MQ135 DE Calidad DE Aire': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBpr4CMObyPT7XU40Pxfs2SAT5txIpz6UDGUB5wooIonQE?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCsvFfwPCMAQ5PDlESqJlp7AZzyLuEJ8VGiwgPb-D4jQEs?download=1'

            ],
            'Módulo Bluetooth inalámbrico HC-05': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC3DCa2um2FQ66yT90f7x4LAR0H6uF604p892Vau3xSe1A?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBeCo7lBML3R6q7WyIr-jHCAaVKGfW_OavNfrfg6MAK4oU?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC9-wWqcD_iRIoL0IxSWfPSAW9qnpI8HrKzS8GLC-4kqDg?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBK1LXy3kV4SZisXEHjOBa0AXUrmBWzjJ-7PfsPQ4iRgdc?download=1'

            ],
            'Optoacoplador, 2 unidades PC817 de placa de aislamiento de 4 canales': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBSMhM7W0snRrrZJsf4k2F9AXiZdCwkX8z58PtcQYP69jg?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCEMjlvYkefRLtPeDfY3aTnAe3_MfcY8lfrXBwGBLtF_6U?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC23zsGAq2IT6i1MDGZE3mOAR39EIlrurSVqu7XqEWLk-4?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQB2lgC6y3_sTp77TuzJgpGjAWNtUmJKSVxp-PoJjl_6gLI?download=1'

            ],
            'Sensor Ultrasonico HC-SR04': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQB3a1G8o9U9g6k2w3j4h7N6Y8C2s1t0y5R7d4O5l9J3R8B?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD6c4I0q2W4i8m0o2q4s6u8w0y2a4c6e8g0i1k3m5o7q?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQB9e7K2s4Y6k0m2o4q6s8u0w2y4a6c8e0g1i3k5m7o9q?download=1'
            ],
            'Sensor MQ-135': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB1g3M5u7Z9m1o3q5s7u9w1y3a5c7e9g1i3k5m7o9q1s?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD4i6O7w9B1o3q5s7u9w1y3a5c7e9g1i3k5m7o9q1s3u?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB7k9Q9y1D3q5s7u9w1y3a5c7e9g1i3k5m7o9q1s3u5w?download=1'
            ],
            'Módulo Bluetooth': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD6n2T4v6X8z0b2d4f6h8j0l2n4p6r8t0v2x4z6a8c0e2g?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB9p5V7x9Z1c3e5g7i9k1m3o5q7s9u1w3y5a7c9e1g3i?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD2r8Y0b2d4f6h8j0l2n4p6r8t0v2x4z6a8c0e2g4i6k?download=1'
            ],
            'Ophtalmologiste': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB5s1A3c5e7g9i1k3m5o7q9s1u3w5y7a9c1e3g5i7k9m?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD8u4C6e8g0i2k4m6o8q0s2u4w6y8a0c2e4g6i8k0m2o?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB1x7E9g1i3k5m7o9q1s3u5w7y9a1c3e5g7i9k1m3o5q?download=1'
            ],
            'Kit Para Armar Smartcar': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD4y0G2i4k6m8o0q2s4u6w8y0z2a4c6e8g0i1k3m5o7q?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB7z3I5k7m9o1q3s5u7w9y1a3c5e7g9i1k3m5o7q9s1u?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD0a6K8m0o2q4s6u8w0y2a4c6e8g0i1k3m5o7q9s1u3w?download=1'
            ],
            'Regleta Multisocket': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB2b9L4n6p8r0t2v4x6z8a0c2e4g6i8k0m2o4q6s8u0w?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD5d2N6p8r0t2v4x6z8a0c2e4g6i8k0m2o4q6s8u0w2y?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB8e5P8r0t2v4x6z8a0c2e4g6i8k0m2o4q6s8u0w2y4a?download=1'
            ],


            'Circuito integrado 555 Timer': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBKyeQ56LvXTJVPHr1BTWNYAS6swzezmNk4DkMeX5c2dYw?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBniBJdV-ThQ6P9zjjhkaLlAcPa7YbsRNAzwZUJwEX7AIc?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDETcwCIgP9S4Gd_C6SWPPLAe8l86Ad0R6BaUQ0x5-BA9o?download=1'
            ],
            'Condensador 10µF 16V': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBxX8M40m94QJfmYzLu7_nUARWbbHrU2ZLMo5D1Q-fB9Kw?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDhPQnX0CYfTatGt4aPK_NaARIxBUnQqT2rrR9d2odiP1M?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDURpF00IJ3TZ0J4M52RwI2Ae76UX5xdnGjXChYPcI7TU8?download=1'
            ],

            'Condensador 100µF 16V': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD1nSU8zRXZRZM0RsYyVk40AYCgxajeJlWSrNZ0EyVH3rA?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAzN5SXuW53TIQ4WPzkh1iSAZpR-1wShDcFqowEU2kW03w?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBCuP7djt1XR5LLuEZq7qu-ATQPQ5sH-YNYciUEDQvodKM?download=1'
            ],
            'Diodo rectificador 1N4007': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDYrodsIvyZRKkvQVvQ7ILaAUqHhSTg7NTxJEp2wDNDkO8?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA0U0ynqS2dSITCTSjvjwWEATty7DvLJLeXjrx22RjdZ-0?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA5b64TloIxSbFNDUhk6oxIAdKsP124Rv4FAe-K6OYbdIk?download=1'
            ],
            'LED rojo 5mm': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCAmk2l6wRMTZMoDIh1zg4lAbCEMtR2w5m_iI6MahQiDhM?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAElwE9OXH4SLgEsC-fvY1cARQHGPEPat2a4xg0KY7bq8E?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDhsz_bxQiuT5PwOzIRQ0f9AUi_OoLJTQaIyky9DP8poRU?download=1'
            ],
            'LED verde 5mm': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBpWyJIy869RoZI6T3RPInUAc1oyOsyrulqytkdAxXTlvU?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDRToak0TvQS4gqiM4nxnmEAbJOILRY0n2eECg1FkGqtWM?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQASFBNXWYERQ6Q7KhsK1-A4ASuWi29OLobkLo4g-LvvF7M?download=1'
            ],
            '10kΩ': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA67S2QOfjiSJrnzfqeGbPzAS1JDEK4yDgYEPvGzzFlBgw?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA5RI6XkE27SLsckfpJAzkIAcBDwqs91rgToaD3UmDFvyI?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCtztiqse08SphWq1S7iKleARZl6Pgfu84A24geGsQSJZE?download=1'
            ],
            'Resistor 1kΩ 1/4W': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCF6vcgUA5KRqZhMxhWDg2wAT9NJE_gh5WbPL5hwhSL7JY?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAl9YOzAIq2SqVbhftDpre8AeNNEcG6kglEe2m90wfR2Ro?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBb6MIOkk_sR5nrXwz4HjnFAagZZrpj_P2JACD9gwF5jN4?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQA1Q0vhujRET5siQYB2-YwZAZCn99-UaE5VNPRgp6YF9R0?download=1'
            ],
            'Transistor NPN BC547': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAco-RBkJwcQ4hbFZvd5TwmAfNta5TUM0sdoXVJkGgpQnY?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCXa8Q5_gTGSpDb95juVojAASuUCHCc9FxzAmCr1CAWYOM?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQDmNxpDmPbnR74-vaDjLnI2AZeWEiWH9WMkEj46XLNz5bc?download=1'
            ],
            'Transistor PNP BC558': [
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQC-9nWcsqC-SZU6-KrxImhrAakq1L5jSShd2HVTxKau0Rs?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBLlY8KdGQrQ6kP48A6a6ySAUdpr4M1KHYGWrutEderipM?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQCj618xQxHeRp-Ys-hOZHYcAdy9y3tkLhQaFextQ8zoxj4?download=1',
              'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQD4nS0COaVVQZ2kfbv4ANdkAeLh-2423ziSrzN3eNGQNaI?download=1'
            ],
            'Seguro de Daños accidentales $5000 - $5999.99': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD3dKjPOQ-9T5kSxSp5MXDAASNemxioCkfH1dRXc9PBIfo?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDze62LUaAQQqdOqFmZSxpKAaoHw48Nqa_ILNjHjnN3-gc?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBvK_-dJASzQYNuqQ9HNxtFAZTcwtEEAyELBctGOa5TV_s?download=1'
            ],
            'Logitech ERGO K860 Teclado partido': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDx1BQM6VFXQqswLESjbc3zAc9KsNXLm312pmOhVSQk5_Y?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAWTak0lN-uS7tPpi940TvHAecXRI9OuiEqJTc8oVExpV8?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQB2kqmlVeiCTIrJ_T5WVQYvAXOiuT_E1sOnBr6VwuEbfyY?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCcILQL8-I2SKqlkBUC1ZL2AQWX0JJZpqiTj3PKJGlrccs?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA8GFaM2uljQ7uqJFeitfO-AU-5TQOBmyUxS9Iii2LDgFI?download=1',
            ],
             '11 Tweezers y Pinzas de Precisión ESD Antiestáticas': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQALQC9Y1iF_T6NTMkfMT136AejSip9r6_FXiqMl7F9qGu4?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCQaomNlh8mSZQfhTZ723gAAfmXUW92_MqsbqeJA6sUZqg?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAatG0PTiivSLhQH_KESNUZAVBHxuTf_xgjDxdM9PomYMw?download=1',
            ],
            'Medidor de energía inteligente controlado por wifi': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBPw1Zki1IzSJDeVbBQg5-hAfKVnn8zzwv1vAcuKarwE9U?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQC89HZCpr3xRa1pUfUhUQz1ARMZb88WnqjjETqW6dW5fwo?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBPz1BluT3TS7V3_gLHYR_mAQ0dcprKosq1xTRFgphvaLQ?download=1',
            ],
            'REGULADOR RS-1410': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBMLdCFj5WCQbJsxfDtgMqBAUqLTfakiC0QGzj8liQdqtI?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAccSRMX-e8SYVB6S_hdVu8AVNZ1-SV7lxO7Pvr0HJFrRk?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCPGUHFiYVqTr4c-tHDBPTOAeXF4kb2J9WE9a-MH7hfHtw?download=1',
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQD5Qqf2YXRgRoGO5NEuSDEdAY5TxAEdGrZPlSFbXIKhidk?download=1',
             ],

              'Tarjeta De Desarrollo Pic18f45k50': [
              'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAmdFYSk68LR4cluXQ37FPIATesRrgiu5KnoVfhEMoSLBE?download=1',
             ],

             'Tarjeta De Desarrollo Uno R3 Dip Compatible Ide Arduino + Cable Usb Qyj' : [
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA_FDJbMqOxSJYiGYR2z0uGATssgoZnYYGSMtrnGejIihQ?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBC0LrDyY66QKbs29Y8GMSWAVSeylsw0AQbDY8g-BKiDR8?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCYMlMG7O5VTJzcUotGiQVzAaGo37TtWvcGO5zEqfsfb4k?download=1',
             ],

             'Kit Para Armar Smartbot | K-720' : [
            'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQB3podooi4gTpK-SkiB--xcAZTgR11x9cAtf73pjxUDUug?download=1',
            'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQBXAWSZ_BfzR7QFIeyd8wIPAXX7QcVbQ8eXKe1Efv6gYtE?download=1',
            'https://tgutierrez-my.sharepoint.com/:u:/g/personal/l23270611_tuxtla_tecnm_mx/IQAZK2xnSPDTQ6txktTCFU_xAVLEYgNJ_MpwC-77hUKymzQ?download=1',

             ],
             'Torre Regleta Multicontacto Pared con 1700J Protector contra Sobretensión' : [
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAT6YVLxFxaRpeVTtws0EGUAUXflN8wxM54EaCSnluclzM?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAz-Uz5hlgeR4xU7Vy7zxrVAQ7dWMAE_9mdLbCuS420Ci4?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBHQw8wJOz8QKTBQQxGp2tzAb2u98h8ZJQNpPgg9cG7Mzw?download=1',
             ],

             'Mouse inalámbrico M280 Logitech' : [
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQACQkJLGr46SYRsnLcSTqHQAcI58h0TPSAtETyBV-k9TCo?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQA1tImIEgkaSr3X5LUcFxxPAeN0H8sMrxwLuvHM5u5OwDM?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQDddIVv7NV8SI-THMrE6IHaAajY45EuJ__8vS0Ss_9yknA?download=1',
             ],
             'UGREEN Hub USB C, 6 en 1 Adaptador Tipo C' : [
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQCgsodzssdVT6IIGHDaRL3mAesoG7ArCwt1jAIrPhoX6R8?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQAeznhWCsFCQZShR7p41gsYAYem_PCdaP4h1y5t-d1HDcs?download=1',
            'https://tgutierrez-my.sharepoint.com/:i:/g/personal/l23270611_tuxtla_tecnm_mx/IQBlPWq0OOvwS4vlxOsR7ci1AXltEyMXqnL7AV4LPnWSMjw?download=1',
             ],

          };

          const selectedGalleryKey = Object.keys(galleryMap).find(key => nombre.includes(key));
          this.galleryImages.set(selectedGalleryKey ? galleryMap[selectedGalleryKey] : [
            'assets/img/no-image.jpg',
            'assets/img/no-image.jpg',
            'assets/img/no-image.jpg'
          ]);

          this.selectedIndex.set(0);
          this.selectedImage.set(this.galleryImages()[0]);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.snack.open('Error cargando producto', 'Cerrar', { duration: 2500 });
        }
      });
  }

  incrementCantidad() {
    if (this.product() && this.cantidad() < this.product()!.unidades) {
      this.cantidad.update(v => v + 1);
    }
  }

  decrementCantidad() {
    if (this.cantidad() > 1) this.cantidad.update(v => v - 1);
  }

  setMainImage(index: number) {
    this.selectedIndex.set(index);
    this.selectedImage.set(this.galleryImages()[index]);
  }

  prevImage() {
    const idx = this.selectedIndex();
    const total = this.galleryImages().length;
    this.setMainImage(idx === 0 ? total - 1 : idx - 1);
  }

  nextImage() {
    const idx = this.selectedIndex();
    const total = this.galleryImages().length;
    this.setMainImage(idx === total - 1 ? 0 : idx + 1);
  }

  openLightbox() { this.showLightbox.set(true); }
  closeLightbox() { this.showLightbox.set(false); }

  @HostListener('touchstart', ['$event'])
  onTouchStart(e: TouchEvent) {
    this.touchStartX = e.changedTouches[0].clientX;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(e: TouchEvent) {
    const end = e.changedTouches[0].clientX;
    if (end < this.touchStartX - 50) this.nextImage();
    if (end > this.touchStartX + 50) this.prevImage();
  }

  createLens() {
    if (!isPlatformBrowser(this.platformId)) return; 
    if (!this.lens || !this.result || !this.mainImage) return;

    const lensEl = this.lens.nativeElement;
    const resultEl = this.result.nativeElement;
    const imgEl = this.mainImage.nativeElement;
    lensEl.style.display = "block";
    resultEl.style.display = "block";
    const cx = resultEl.offsetWidth / lensEl.offsetWidth;
    const cy = resultEl.offsetHeight / lensEl.offsetHeight;
    resultEl.style.backgroundImage = `url(${this.selectedImage()})`;
    resultEl.style.backgroundSize = `${imgEl.width * cx}px ${imgEl.height * cy}px`;
  }

  moveLens(e: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return; 
    if (!this.lens || !this.result || !this.mainImage) return;

    const pos = this.getCursorPos(e);
    let x = pos.x - this.lens.nativeElement.offsetWidth / 2;
    let y = pos.y - this.lens.nativeElement.offsetHeight / 2;
    const maxX = this.mainImage.nativeElement.width - this.lens.nativeElement.offsetWidth;
    const maxY = this.mainImage.nativeElement.height - this.lens.nativeElement.offsetHeight;
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    this.lens.nativeElement.style.left = x + "px";
    this.lens.nativeElement.style.top = y + "px";
    const cx = this.result.nativeElement.offsetWidth / this.lens.nativeElement.offsetWidth;
    const cy = this.result.nativeElement.offsetHeight / this.lens.nativeElement.offsetHeight;
    this.result.nativeElement.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  }

  removeLens() {
    if (!isPlatformBrowser(this.platformId)) return; 
    if (!this.lens || !this.result) return;
    this.lens.nativeElement.style.display = "none";
    this.result.nativeElement.style.display = "none";
  }

  getCursorPos(e: MouseEvent) {
    const rect = this.mainImage.nativeElement.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }
  
  addToCart(codigo_producto: number) {
    const prod = this.product();
    if (!prod) return;

    const clientData = this.authService.getClientData();

    if (!clientData) {
      this.snack.open('Debes iniciar sesión para agregar productos al carrito', 'Iniciar sesión', {
        duration: 5000
      }).onAction().subscribe(() => {
        this.router.navigate(['/login']);
      });

      this.router.navigate(['/login']);
      return;
    }

    const telefonoCliente = clientData.id;
    const idventas = this.cartService.currentCartId();

    if (!idventas) {
      this.cartService.crearCarrito(telefonoCliente, 1).subscribe({
        next: (res) => {
          this.cartService.currentCartId.set(res.idventas);

          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem("venta_id", String(res.idventas));
          }

          this.addOrUpdateProduct(res.idventas, codigo_producto);
        },
        error: (error) => {
          console.error('Error al crear carrito:', error);
          this.snack.open('No se pudo crear el carrito', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.addOrUpdateProduct(idventas, codigo_producto);
    }
  }

  private addOrUpdateProduct(idventas: number, codigo_producto: number) {
    this.cartService.addOrUpdateProduct(idventas, codigo_producto, this.cantidad()).subscribe({
      next: () => {
        this.snack.open('¡Producto agregado al carrito!', 'Ver carrito', { duration: 3000 })
          .onAction().subscribe(() => this.router.navigate(['/carrito']));

        setTimeout(() => this.router.navigate(['/carrito']), 300);
      },
      error: (err) => {
        console.error('Error al agregar al carrito:', err);
        this.snack.open('Error al agregar el producto', 'Cerrar', { duration: 3000 });
      }
    });
  }
}