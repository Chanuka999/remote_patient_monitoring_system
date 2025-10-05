import joblib
model = joblib.load("h.pickle")

model2 = joblib.load("brest_cancer.pickle")


sample_input = [[14.1, 20.2, 90.4, 600.3, 0.1, 0.2, 0.3, 0.1, 0.2, 0.05,
                 0.25, 1.1, 1.2, 10.5, 0.005, 0.01, 0.02, 0.002, 0.004, 0.001,
                 16.3, 30.2, 120.5, 800.1, 0.14, 0.25, 0.35, 0.12, 0.3, 0.07]]

pre=model.predict([[0.98336935,  1.11629198, -0.50392314,  1.18980409, -0.7198664 ,0.13065713]])

print("heart patient :",pre)

prediction = model2.predict(sample_input)


print("canser Prediction :", prediction)


if prediction[0] == 0:
    print("Prediction:  Not Cancerous")
else:
    print("Prediction: Cancerous")



