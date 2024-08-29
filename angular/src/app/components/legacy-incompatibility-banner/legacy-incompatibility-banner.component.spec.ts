import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegacyIncompatibilityBannerComponent } from './legacy-incompatibility-banner.component';

describe('LegacyIncompatibilityBannerComponent', () => {
  let component: LegacyIncompatibilityBannerComponent;
  let fixture: ComponentFixture<LegacyIncompatibilityBannerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegacyIncompatibilityBannerComponent]
    });
    fixture = TestBed.createComponent(LegacyIncompatibilityBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
