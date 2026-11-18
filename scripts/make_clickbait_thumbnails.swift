#!/usr/bin/env swift
import AppKit
import CoreGraphics
import CoreImage

struct ClickbaitSpec {
    let filename: String
    let topBanner: String
    let stampText: String
    let calloutLabel: String
    let targetX: CGFloat
    let targetY: CGFloat
}

let specs: [ClickbaitSpec] = [
    ClickbaitSpec(
        filename: "m5-macbook-pro-throttle-trap.jpg",
        topBanner: "APPLE HID THIS INSIDE!",
        stampText: "$1,599 TRAP?!",
        calloutLabel: "MISSING FAN! 102°C!",
        targetX: 1120,
        targetY: 420
    ),
    ClickbaitSpec(
        filename: "snapdragon-8-elite-vs-a18-pro.jpg",
        topBanner: "IPHONE DESTROYED?!",
        stampText: "OVERHEATING?!",
        calloutLabel: "14.8 WATTS! TOO HOT!",
        targetX: 1050,
        targetY: 450
    ),
    ClickbaitSpec(
        filename: "rtx-5090-laptop-gpu.jpg",
        topBanner: "$3,699 LAPTOP SECRET!",
        stampText: "175W WALL!",
        calloutLabel: "POWER LOCKED HERE!",
        targetX: 1080,
        targetY: 430
    ),
    ClickbaitSpec(
        filename: "cloud-outage-monoculture.jpg",
        topBanner: "HALF THE INTERNET DEAD!",
        stampText: "1 BAD FILE?!",
        calloutLabel: "SINGLE KILL SWITCH!",
        targetX: 980,
        targetY: 440
    ),
    ClickbaitSpec(
        filename: "media-traffic-heist.jpg",
        topBanner: "TRAFFIC DOWN 64%!",
        stampText: "STOLEN DATA?!",
        calloutLabel: "ZERO CLICKS SENT!",
        targetX: 1060,
        targetY: 430
    ),
    ClickbaitSpec(
        filename: "day-one-firmware-beta-trap.jpg",
        topBanner: "STOP BUYING DAY ONE!",
        stampText: "114°C MELTDOWN!",
        calloutLabel: "PIN #3 MELTING HERE!",
        targetX: 1020,
        targetY: 460
    ),
    ClickbaitSpec(
        filename: "oled-monitor-vrr-flicker-burn-in-warranty-trap.jpg",
        topBanner: "$1,200 MONITOR REGRET!",
        stampText: "FLICKER & BURN!",
        calloutLabel: "DIMS 75% ON DESKTOP!",
        targetX: 1040,
        targetY: 440
    ),
    ClickbaitSpec(
        filename: "8gb-vram-gpu-obsolescence-trap-2026.jpg",
        topBanner: "DO NOT BUY 8GB GPUS!",
        stampText: "$400 E-WASTE!",
        calloutLabel: "VRAM CHOKED AT 1080P!",
        targetX: 1060,
        targetY: 440
    )
]

let fm = FileManager.default
let dir = URL(fileURLWithPath: fm.currentDirectoryPath).appendingPathComponent("public/images/articles")

// Copy a base photo for the new 8GB VRAM article if it doesn't exist yet
let vramUrl = dir.appendingPathComponent("8gb-vram-gpu-obsolescence-trap-2026.jpg")
let rtxUrl = dir.appendingPathComponent("rtx-5090-laptop-gpu.jpg")
if !fm.fileExists(atPath: vramUrl.path) && fm.fileExists(atPath: rtxUrl.path) {
    try? fm.copyItem(at: rtxUrl, to: vramUrl)
}

let width: Int = 1600
let height: Int = 900

for spec in specs {
    let fileUrl = dir.appendingPathComponent(spec.filename)
    guard let srcImage = NSImage(contentsOf: fileUrl) else {
        print("Skipping missing \(spec.filename)")
        continue
    }

    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: width,
        pixelsHigh: height,
        bitsPerSample: 8,
        samplesPerPixel: 4,
        hasAlpha: true,
        isPlanar: false,
        colorSpaceName: .deviceRGB,
        bytesPerRow: 0,
        bitsPerPixel: 0
    )!

    NSGraphicsContext.saveGraphicsState()
    let ctx = NSGraphicsContext(bitmapImageRep: rep)!
    NSGraphicsContext.current = ctx
    let cg = ctx.cgContext

    // 1. Draw base photograph cropped to 1600x900
    srcImage.draw(
        in: NSRect(x: 0, y: 0, width: width, height: height),
        from: .zero,
        operation: .copy,
        fraction: 1.0
    )

    // 2. Darken edges / dramatic contrast overlay so bright yellow/red clickbait elements POP
    cg.setFillColor(NSColor(calibratedRed: 0.03, green: 0.02, blue: 0.02, alpha: 0.38).cgColor)
    cg.fill(CGRect(x: 0, y: 0, width: width, height: height))

    // 3. Glowing Red "Danger / Thermal Hotspot" Aura at targetX, targetY
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    let glowColors = [
        NSColor(calibratedRed: 1.0, green: 0.1, blue: 0.0, alpha: 0.72).cgColor,
        NSColor(calibratedRed: 0.9, green: 0.0, blue: 0.0, alpha: 0.25).cgColor,
        NSColor(calibratedRed: 0.0, green: 0.0, blue: 0.0, alpha: 0.0).cgColor
    ] as CFArray
    let locations: [CGFloat] = [0.0, 0.5, 1.0]
    if let grad = CGGradient(colorsSpace: colorSpace, colors: glowColors, locations: locations) {
        let center = CGPoint(x: spec.targetX, y: CGFloat(height) - spec.targetY)
        cg.drawRadialGradient(grad, startCenter: center, startRadius: 10, endCenter: center, endRadius: 240, options: [])
    }

    // 4. Giant Glowing Yellow + Red Clickbait Circle around Hotspot
    let circleCenter = CGPoint(x: spec.targetX, y: CGFloat(height) - spec.targetY)
    cg.setLineWidth(18)
    cg.setStrokeColor(NSColor(calibratedRed: 1.0, green: 0.92, blue: 0.0, alpha: 1.0).cgColor)
    cg.strokeEllipse(in: CGRect(x: circleCenter.x - 155, y: circleCenter.y - 155, width: 310, height: 310))

    cg.setLineWidth(10)
    cg.setStrokeColor(NSColor(calibratedRed: 0.92, green: 0.1, blue: 0.08, alpha: 1.0).cgColor)
    cg.strokeEllipse(in: CGRect(x: circleCenter.x - 140, y: circleCenter.y - 140, width: 280, height: 280))

    // 5. Giant Clickbait Arrow pointing from left-center into the circle
    let arrowStart = CGPoint(x: circleCenter.x - 390, y: circleCenter.y + 130)
    let arrowTip = CGPoint(x: circleCenter.x - 150, y: circleCenter.y + 35)

    let arrowPath = CGMutablePath()
    arrowPath.move(to: arrowStart)
    arrowPath.addLine(to: arrowTip)
    cg.setLineCap(.round)
    cg.setLineWidth(28)
    cg.setStrokeColor(NSColor.black.cgColor)
    cg.addPath(arrowPath)
    cg.strokePath()

    cg.setLineWidth(20)
    cg.setStrokeColor(NSColor(calibratedRed: 1.0, green: 0.92, blue: 0.0, alpha: 1.0).cgColor)
    cg.addPath(arrowPath)
    cg.strokePath()

    // Arrowhead triangle
    let headPath = CGMutablePath()
    headPath.move(to: CGPoint(x: arrowTip.x + 25, y: arrowTip.y - 10))
    headPath.addLine(to: CGPoint(x: arrowTip.x - 55, y: arrowTip.y + 55))
    headPath.addLine(to: CGPoint(x: arrowTip.x - 30, y: arrowTip.y - 50))
    headPath.closeSubpath()
    cg.setFillColor(NSColor(calibratedRed: 0.95, green: 0.1, blue: 0.08, alpha: 1.0).cgColor)
    cg.setStrokeColor(NSColor(calibratedRed: 1.0, green: 0.92, blue: 0.0, alpha: 1.0).cgColor)
    cg.setLineWidth(6)
    cg.addPath(headPath)
    cg.drawPath(using: .fillStroke)

    // 6. Top-Left High-Contrast Red Warning Ribbon
    let topBannerRect = CGRect(x: 48, y: CGFloat(height) - 145, width: 780, height: 92)
    cg.setFillColor(NSColor.black.cgColor)
    cg.fill(topBannerRect.offsetBy(dx: 8, dy: -8))
    cg.setFillColor(NSColor(calibratedRed: 0.88, green: 0.12, blue: 0.08, alpha: 1.0).cgColor)
    cg.fill(topBannerRect)
    cg.setStrokeColor(NSColor.white.cgColor)
    cg.setLineWidth(5)
    cg.stroke(topBannerRect)

    let paragraphStyle = NSMutableParagraphStyle()
    paragraphStyle.alignment = .center

    let bannerAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: 52, weight: .black),
        .foregroundColor: NSColor.white,
        .paragraphStyle: paragraphStyle
    ]
    NSString(string: "⚠️ " + spec.topBanner).draw(
        in: NSRect(x: 56, y: CGFloat(height) - 135, width: 764, height: 74),
        withAttributes: bannerAttrs
    )

    // 7. Giant Yellow/Black Impact Stamp in Bottom-Left
    let stampRect = CGRect(x: 48, y: 58, width: 720, height: 150)
    cg.setFillColor(NSColor.black.cgColor)
    cg.fill(stampRect.offsetBy(dx: 10, dy: -10))
    cg.setFillColor(NSColor(calibratedRed: 1.0, green: 0.88, blue: 0.0, alpha: 1.0).cgColor)
    cg.fill(stampRect)
    cg.setStrokeColor(NSColor.black.cgColor)
    cg.setLineWidth(8)
    cg.stroke(stampRect)

    let stampAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.systemFont(ofSize: 78, weight: .heavy),
        .foregroundColor: NSColor.black,
        .paragraphStyle: paragraphStyle
    ]
    NSString(string: spec.stampText).draw(
        in: NSRect(x: 56, y: 74, width: 704, height: 115),
        withAttributes: stampAttrs
    )

    // 8. Red Callout Pill Below Circle
    let pillRect = CGRect(x: circleCenter.x - 260, y: circleCenter.y - 235, width: 520, height: 68)
    cg.setFillColor(NSColor.black.cgColor)
    cg.fill(pillRect)
    cg.setStrokeColor(NSColor(calibratedRed: 1.0, green: 0.92, blue: 0.0, alpha: 1.0).cgColor)
    cg.setLineWidth(4)
    cg.stroke(pillRect)

    let pillAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont.monospacedSystemFont(ofSize: 34, weight: .black),
        .foregroundColor: NSColor(calibratedRed: 1.0, green: 0.92, blue: 0.0, alpha: 1.0),
        .paragraphStyle: paragraphStyle
    ]
    NSString(string: spec.calloutLabel).draw(
        in: NSRect(x: pillRect.minX + 8, y: pillRect.minY + 12, width: pillRect.width - 16, height: 48),
        withAttributes: pillAttrs
    )

    NSGraphicsContext.restoreGraphicsState()

    if let jpegData = rep.representation(using: .jpeg, properties: [.compressionFactor: 0.88]) {
        try jpegData.write(to: fileUrl)
        print("Generated clickbait thumbnail: \(spec.filename)")
    }
}
