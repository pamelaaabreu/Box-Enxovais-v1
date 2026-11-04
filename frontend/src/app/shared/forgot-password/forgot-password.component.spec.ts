import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../core/services/auth.service';
import { CustomAlertService } from '../../core/services/custom-alert.service';

describe('ForgotPasswordComponent recovery', () => {
  let component: ForgotPasswordComponent;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['validateResetCode', 'requestPasswordReset', 'savePasswordResetToken', 'clearPasswordResetEmail', 'clearPasswordResetToken', 'savePasswordResetEmail']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({providers: [
      {provide: AuthService, useValue: auth},
      {provide: Router, useValue: router},
      {provide: ActivatedRoute, useValue: {snapshot: {data: {}}}},
      {provide: CustomAlertService, useValue: jasmine.createSpyObj('Alert', ['success','error'])},
    ]});
    component = TestBed.runInInjectionContext(() => new ForgotPasswordComponent());
    component.step = 'otp';
    component.forgotForm.controls.email.setValue('user@example.com');
  });
  afterEach(() => component.ngOnDestroy());
  function paste(code: string) {
    component.onOtpPaste({preventDefault: () => {}, clipboardData: {getData: () => code}} as unknown as ClipboardEvent);
  }
  it('submits from the actual eight-input form and navigates after verification', () => {
    const response = new Subject<any>();
    auth.validateResetCode.and.returnValue(response);
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const page = fixture.componentInstance;
    page.step = 'otp';
    page.forgotForm.controls.email.setValue('user@example.com');
    fixture.detectChanges();
    const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('.otp-input');
    'AB12CD34'.split('').forEach((character, index) => {
      inputs[index].value = character;
      inputs[index].dispatchEvent(new Event('input', { bubbles: true }));
    });
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.otp-submit');
    expect(button.disabled).toBeFalse();
    // Prevent native navigation even if the Angular submit binding regresses.
    fixture.nativeElement.querySelector('form').addEventListener('submit', (event: Event) => event.preventDefault());
    button.click();
    expect(auth.validateResetCode).toHaveBeenCalledOnceWith('user@example.com', 'AB12CD34');
    expect(page.isLoading).toBeTrue();
    response.next({ success: true, data: { resetToken: 'test-reset-token' } });
    response.complete();
    expect(auth.savePasswordResetToken).toHaveBeenCalledWith('test-reset-token');
    expect(router.navigate).toHaveBeenCalledWith(['/reset-password']);
    fixture.destroy();
  });
  it('pastes eight characters, normalizes case and refuses incomplete codes', () => {
    paste('ab12cd34');
    expect(component.otpForm.getRawValue().join('')).toBe('AB12CD34');
    paste('abc'); component.onSubmit();
    expect(auth.validateResetCode).not.toHaveBeenCalled();
  });
  it('submits a single request and navigates with an in-memory token', () => {
    const response = new Subject<any>(); auth.validateResetCode.and.returnValue(response);
    paste('AB12CD34'); component.onSubmit(); component.onSubmit();
    expect(auth.validateResetCode).toHaveBeenCalledTimes(1);
    expect(component.isLoading).toBeTrue();
    response.next({success: true, data: {resetToken: 'secret'}}); response.complete();
    expect(auth.savePasswordResetToken).toHaveBeenCalledWith('secret');
    expect(router.navigate).toHaveBeenCalledWith(['/reset-password']);
    expect(component.isLoading).toBeFalse();
  });
  [400,410,0,500].forEach(status => it(`handles error ${status}`, () => {
    auth.validateResetCode.and.returnValue(throwError(() => new HttpErrorResponse({status})));
    paste('AB12CD34'); component.onSubmit();
    expect(component.otpError).toContain(status === 410 ? 'expirou' : status === 400 ? 'inválido' : status === 0 ? 'conexão' : 'Não foi possível');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(component.isLoading).toBeFalse();
  }));
  it('respects cooldown and clears the old code after resend', () => {
    auth.requestPasswordReset.and.returnValue(of({success:true}));
    component.resendSeconds=10; component.resendCode();
    expect(auth.requestPasswordReset).not.toHaveBeenCalled();
    component.resendSeconds=0; paste('AB12CD34'); component.resendCode();
    expect(auth.requestPasswordReset).toHaveBeenCalledTimes(1);
    expect(component.resendSeconds).toBe(30);
    expect(component.otpForm.invalid).toBeTrue();
  });
});

// Real template + AuthService + HttpClient; only the transport and router are
// replaced. No calls to onSubmit() in these tests: submission starts at the DOM.
describe('OTP form HTTP integration', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  let router: jasmine.SpyObj<Router>;
  beforeEach(() => {
    router = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({providers: [
      provideHttpClient(), provideHttpClientTesting(),
      {provide: Router, useValue: router},
      {provide: ActivatedRoute, useValue: {snapshot: {data: {}}}},
      {provide: CustomAlertService, useValue: jasmine.createSpyObj('Alert', ['success', 'error'])},
    ]});
    auth = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function submitFromScreen() {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    fixture.componentInstance.step = 'otp';
    fixture.componentInstance.forgotForm.controls.email.setValue('user@example.com');
    fixture.detectChanges();
    const fields: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('.otp-input');
    'AB12CD34'.split('').forEach((value, index) => {
      fields[index].value = value;
      fields[index].dispatchEvent(new Event('input', {bubbles: true}));
    });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.otp-submit').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.otp-submit').disabled).toBeTrue();
    const request = http.expectOne('http://localhost:8080/validate-reset-code');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({email: 'user@example.com', code: 'AB12CD34'});
    return {fixture, request};
  }
  it('posts the code and stores the returned token before navigation', () => {
    const {fixture, request} = submitFromScreen();
    router.navigate.and.callFake(() => {
      expect(auth.getPasswordResetToken()).toBe('test-only-token');
      return Promise.resolve(true);
    });
    request.flush({success: true, message: 'OK', data: {resetToken: 'test-only-token'}});
    expect(router.navigate).toHaveBeenCalledOnceWith(['/reset-password']);
    fixture.destroy();
  });
  [400, 410, 500].forEach(status => it(`renders an error after HTTP ${status}`, () => {
    const {fixture, request} = submitFromScreen();
    request.flush({success: false}, {status, statusText: 'Error'});
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent.trim()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.otp-submit').disabled).toBeFalse();
    expect(auth.getPasswordResetToken()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
    fixture.destroy();
  }));
});
